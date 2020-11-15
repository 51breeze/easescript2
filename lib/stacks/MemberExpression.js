const Stack = require("../Stack");
const Utils = require("../Utils");
class MemberExpression extends Stack{

   constructor(compilation,node,scope,parentNode,parentStack)
   {
        super(compilation,node,scope,parentNode,parentStack);
        this.object = Utils.createStack( compilation, node.object, scope, node,this );
        this.property = Utils.createStack( compilation, node.property, scope, node,this );
   }

   get description()
   {
      //this.object.description
   }

   parser()
   {
   }

   value()
   {
      return `${this.object.value()}.${this.property.value()}`;
   }

   raw()
   { 
      return `${this.object.raw()}.${this.property.raw()}`;
   }

   emit()
   {
      return this.raw();
   }
}

module.exports = MemberExpression;
