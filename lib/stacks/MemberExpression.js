const Stack = require("../Stack");
const Utils = require("../Utils");
const Module = require("../Module");
const Expression = require("./Expression");
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
          const description = this.object.description();
          const property    = this.property.value();
          const isStaitc = description instanceof Module && description.id == this.object.value();
          return this.compilation.getReference(property,description,isStaitc, this._accessor );
      }else if( Utils.isStackByName(this.object,"CallExpression") ){
         let description = this.object.description();
         const property    = this.property.value();
         if( description.callableConstructor ){
            description=description.type();
         }
         return this.compilation.getReference(property,description,false, this._accessor);
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
         this.throwError(`"${this.raw()}" is not defined.`);
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
