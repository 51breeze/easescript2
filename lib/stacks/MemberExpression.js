const Stack = require("../Stack");
const Utils = require("../Utils");
const Module = require("../Module");
const Expression = require("./Expression");
const UnionType = require("../UnionType");
const TupleType = require("../TupleType");
const Type = require("../Type");
class MemberExpression extends Expression{

   constructor(compilation,node,scope,parentNode,parentStack)
   {
        super(compilation,node,scope,parentNode,parentStack);
        this.object = Utils.createStack( compilation, node.object, scope, node, this );
        this.property = Utils.createStack( compilation, node.property, scope, node,this );
        this._accessor = null;
   }

   set accessor( val ){
       this._accessor = val;
       this.object.accessor = val;
   }

   description(){
      const classType = this.compilation.getType("Class");
      const fetchClass = (reference,type)=>{
         if(reference && type.is( classType ) ){
            if(Array.isArray(reference)){
               const refer = reference.find( item=>{
                  if( Utils.isStackByName(item,"Identifier") || Utils.isStackByName(item,"MemberExpression") ){
                     return this.compilation.getTypeWhenExist( item.value() );
                  }
               });
               if( refer ){
                  return this.compilation.getTypeWhenExist( refer.value() );
               }
            }else if( Utils.isStackByName(reference,"Identifier") || Utils.isStackByName(reference,"MemberExpression") ){
               return this.compilation.getTypeWhenExist( reference.value() );
            }
         }
         return null;
      }
      const getDescription = (description, property, targetName)=>{
         if( !description )return null;
         const isModule = description instanceof Module && description !== classType;
         let isStatic = isModule && targetName && description === this.compilation.getTypeWhenExist( targetName );
         let classModule = isModule ? description : null;
         if( !classModule ){
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
               if( desc && Array.isArray(desc.params)){
                  desc.params.forEach( item=>{
                     item.once("fetchAcceptType",(event)=>{
                        if( event ){
                            event.acceptType = description;
                        }
                     });
                  });
               }
               return desc;
            }else if(description instanceof Type){
               classModule = fetchClass( reference, description );
               isStatic = !!classModule;
            }
         }
         description = classModule||description;
         return this._description = this.compilation.getReference(property,description,isStatic,this._accessor);
      }
      const property    = this.property.value();
      if( this.object instanceof MemberExpression ){
          let description = this.object.description();
          if( description instanceof Stack ){
             description = description.type();
          }
          return getDescription(description,property);
      }else if( Utils.isStackByName(this.object,"CallExpression") ){
         let description = this.object.description();
         return getDescription( description && description.type(), property );
      }else{
         const target =  this.object.value();
         let description =  this.scope.define(target) || this.compilation.getType(target);
         if(description instanceof Stack){
             description = description.type();
         }
         return getDescription(description, property, target);
      }
   }

   type(){
      const description = this.description();
      return description instanceof Stack ? description.type() : description;
   }

   parser(syntax){
      const desc = this.description();
      if( !desc ){
         this.throwError(`"${this.raw()}" does not exist.`);
      }
   }

   value(){
      return `${this.object.value()}.${this.property.value()}`;
   }

   emit(syntax){
      const object = this.object.emit( syntax );
      const property = this.property.emit( syntax );
      const description = this.description()
      if( description && description.kind ==="get" ){
         return `${object}.${property}()`;
      }
      return  `${object}.${property}`;
   }
}

module.exports = MemberExpression;
