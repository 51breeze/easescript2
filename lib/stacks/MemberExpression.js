const Stack = require("../Stack");
const Utils = require("../Utils");
const Module = require("../Module");
class MemberExpression extends Stack{

   constructor(compilation,node,scope,parentNode,parentStack)
   {
        super(compilation,node,scope,parentNode,parentStack);
        this.object = Utils.createStack( compilation, node.object, scope, node, this );
        this.property = Utils.createStack( compilation, node.property, scope, node,this );
   }

   description(){
      if( this.object instanceof MemberExpression ){
          const description = this.object.description();
          const property    = this.property.value();
          const isStaitc = description instanceof Module && description.id == this.object.value();
          return this.compilation.getReference(property,description,isStaitc);
      }else{
         const target =  this.object.value();
         const description =  this.scope.define( target ) || this.compilation.getType(target);
         const property    = this.property.value();
         const isStaitc = description instanceof Module && description.id == target;
         return this.compilation.getReference(property,description,isStaitc);
      }
   }

   type(){
      const description = this.description();
      return description ? description.type() : null;
   }

   parser(syntax)
   {
   }

   value(){
      return `${this.object.value()}.${this.property.value()}`;
   }

   emit(syntax)
   {
      const object = this.object.emit( syntax );
      const property = this.property.emit( syntax );
      return  `${object}.${property}`;
   }
}

module.exports = MemberExpression;
