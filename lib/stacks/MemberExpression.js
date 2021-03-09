const Stack = require("../Stack");
const Utils = require("../Utils");
const Module = require("../Module");
const Expression = require("./Expression");
const UnionType = require("../UnionType");
const TupleType = require("../TupleType");
const Type = require("../Type");
const AnyType = require("../AnyType");
class MemberExpression extends Expression{

   constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isMemberExpression = true;
        this.object = Utils.createStack( compilation, node.object, scope, node, this );
        this.property = Utils.createStack( compilation, node.property, scope, node,this );
        this._accessor = null;
        this.computed = !!node.computed;
   }

   set accessor( val ){
       this._accessor = val;
       this.object.accessor = val;
   }

   throwError(message){
      this.object.throwError(message);
   }

   throwWarn(message){
      this.object.throwWarn(message);
   }

   getDescription(grammar){
      const classType = this.compilation.getType("Class");
      const fetchClass = (reference,type)=>{
         if(reference && (reference.isIdentifier || reference.isMemberExpression) && type.is( classType ) ){
            return this.compilation.getTypeWhenExist( reference.value() );
         }
         return null;
      }
      const getDescription = (description, property, targetName)=>{
         if( !description )return null;
         if( description.isAny )return description;
         if( description.isGenericType && description.extends.length > 0){
            description = description.extends[0];
         }
         const isModule = description instanceof Module && description !== classType;
         let isStatic = isModule && targetName && description === this.compilation.getTypeWhenExist( targetName );
         let classModule = isModule ? description : null;
         if( !classModule && description.isType ){
            const reference = this.object.reference();
            if( description instanceof UnionType ){
               description = description.types.find( type=>{
                  classModule = fetchClass( reference, type );
                  isStatic = !!classModule;
                  return this.compilation.getReference(property,classModule||type,isStatic,this._accessor);
               });
            }else if( description instanceof TupleType){
               const type = this.compilation.getType("Array");
               const desc = this.compilation.getReference(property,type,isStatic,this._accessor);
               this.addListener("FETCH_TUPLE_TYPE",(event)=>{
                  if( event ){
                     event.type = description;
                     event.target= desc;
                  }
               });
               return desc;
            }else if(description instanceof Type){
               classModule = fetchClass( reference, description );
               isStatic = !!classModule;
            }
         }
         description = classModule||description;
         return this.compilation.getReference(property,description,isStatic,this._accessor);
      }

      const getObjectAttribute=(description,property)=>{
         let object = description.reference();
         if( object.isStack && object.isDeclarator ){
            object = object.type();
         }
         if( !object || !(object.isObjectExpression || object.isArrayExpression || object.isLiteralType || object.isGenericType) ){
            return null;
         }
         const desc = object.attribute( property );
         if( desc ){
            return desc.description();
         }
      }
      let property = this.property.value();
      if( this.computed && this.property.isIdentifier ){
         const propertyRef = this.property.reference();
         if(propertyRef === this.property && !this.property.description().isDeclarator){
            this.computed = false;
         }else if( propertyRef instanceof Stack ){
            property = propertyRef.value()
         }
      }
      if( this.object.isMemberExpression ){
          let description = this.object.description();
          if( description instanceof Stack ){
             const desc = getObjectAttribute(description, property );
             if( desc ){
                return desc;
             }
             description = description.type();
          }
          return getDescription(description,property);
      }else if( this.object.isCallExpression || this.object.isSuperExpression ){
         let description = this.object.description();
         if( description instanceof Stack){
            const desc = getObjectAttribute(description, property );
            if( desc )return desc;
            description = description.type();
         }else if( description && description.isConstructor ){
            description = description.type();
         }
         return getDescription(description, property );
      }else{
         const target =  this.object.value();
         let description =  this.scope.define(target) || this.compilation.getType(target);
         if(description instanceof Stack){
            const desc = getObjectAttribute(description, property);
            if( desc ){
               return desc;
            }else{
               description = description.type();
            }
         }
         return getDescription(description, property, target);
      }
   }

   description(grammar){
      const desc = this.__description || (this.__description = this.getDescription(grammar));
      if( !desc && this.computed ){
         this.__description = new AnyType();
         this.__description.computed = true;
         return this.__description
      }
      return desc;
   }

   type(){
      const description = this.description();
      return description instanceof Stack ? description.type() : description;
   }

   check(grammar){
      const desc = this.description(grammar);
      if( !desc ){
         this.property.throwError(`"${this.value()}" does not exist.`);
      }else if( desc.isMethodDefinition || desc.isPropertyDefinition ){
         const modifier = desc.modifier ? desc.modifier.value() : 'public';
         if( modifier === "private" && desc.compilation.module !== this.compilation.module ){
            this.property.throwError(`"${this.value()}" is not accessible.`);
         }else if(modifier === "protected" && desc.compilation.module.namespace !== this.compilation.module.namespace){
            this.property.throwError(`"${this.value()}" is not accessible.`);
         }
      }
      return desc;
   }

   value(){
      if( this.computed ){
         return `${this.object.value()}[${this.property.raw()}]`;
      }
      return `${this.object.value()}.${this.property.value()}`;
   }
}

module.exports = MemberExpression;
