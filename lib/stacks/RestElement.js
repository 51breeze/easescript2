const Stack = require("../Stack");
const Utils = require("../Utils");
class RestElement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        scope.define(node.name, this);
   }

   description(){
       return this.compilation.getType("Array");
   }

   parser(syntax)
   {
      return this.body.parser(syntax);
   }

   raw()
   {
       return this.node.name;
   }

   emit(syntax)
   {
       return this.node.name;
   }
}

module.exports = RestElement;