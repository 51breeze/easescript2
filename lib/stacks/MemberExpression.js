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
      if( this.object instanceof MemberExpression ){
          let description = this.object.description();
          const property    = this.property.value();
          const isStaitc = description instanceof Module && description.id == this.object.value();
          if( Utils.isStackByName(description,"MethodDefinition") && description.kind ==="get" ){
               description = description.type();
               console.log( description )
          }
          return this.compilation.getReference(property,description,isStaitc, this._accessor );
      }else if( Utils.isStackByName(this.object,"CallExpression") ){
         const property  = this.property.value();
         const classType = this.compilation.getType("Class");
         const reference = this.object.reference();
         let description = this.object.description().type();
         let isStaitc = false;
         const fetchClass = (type)=>{
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
         if( description instanceof UnionType ){
            description = description.types.find( type=>{
               const classModule = fetchClass( type );
               let isStaitc = !!classModule;
               return this.compilation.getReference(property,classModule||type,isStaitc,this._accessor);
            });
         }else{
            const classModule = fetchClass( description );
            description = classModule||description;
            isStaitc = !!classModule;
         }
         return this.compilation.getReference(property,description,isStaitc,this._accessor);
      }else{
         const target =  this.object.value();
         const description =  this.scope.define( target ) || this.compilation.getType(target);
         const property    = this.property.value();
         const isStaitc = description instanceof Module && description.id == target;
         return this.compilation.getReference(property,description,isStaitc, this._accessor);
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
