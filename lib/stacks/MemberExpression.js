const Stack = require("../Stack");
const Utils = require("../Utils");
const Module = require("../Module");
const Expression = require("./Expression");
const UnionType = require("../UnionType");
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

      const fetchClass = (reference,classType,type)=>{
         if(reference && type.is( classType ) ){
            const refer = reference.find( item=>{
               if( Utils.isStackByName(item,"Identifier") || Utils.isStackByName(item,"MemberExpression") ){
                   return this.compilation.getTypeWhenExist( item.value() );
               }
            });
            if( refer ){
               return this.compilation.getTypeWhenExist( refer.value() );
            }
         }
         return null;
      }

      const getDescription = (description, property)=>{
         const classType = this.compilation.getType("Class");
         const reference = this.object.reference();
         let isStatic = false;
         let classModule = null;
         if( description instanceof UnionType ){
            description = description.types.find( type=>{
               classModule = fetchClass( reference, classType, type );
               isStatic = !!classModule;
               return this.compilation.getReference(property,classModule||type,isStatic,this._accessor);
            });
         }else{
            classModule = fetchClass( reference, classType, description );
            isStatic = !!classModule;
         }
         description = classModule||description;
         return this.compilation.getReference(property,description,isStatic,this._accessor);
      }

      if( this.object instanceof MemberExpression ){
          let description = this.object.description();
          const property    = this.property.value();
          const isStatic = description instanceof Module && description.id == this.object.value();
          if( Utils.isStackByName(description,"MethodGetterDefinition") ){
            return getDescription( description.type(),property);
          }
          return this.compilation.getReference(property,description,isStatic, this._accessor );
      }else if( Utils.isStackByName(this.object,"CallExpression") ){
         return getDescription( this.object.description().type(), this.property.value() );
      }else{
         const target =  this.object.value();
         const description =  this.scope.define( target ) || this.compilation.getType(target);
         const property    = this.property.value();
         const isStatic = description instanceof Module && description.id == target;
         return this.compilation.getReference(property,description,isStatic, this._accessor);
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
