const Stack = require("../Stack");
const Utils = require("../Utils");
class Identifier extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
   }

   parser(){

   }

   value()
   {
      return this.node.name;
   }

   raw(){
       return this.node.name;
   }

   emit(){
       return this.node.name;
   }
}

module.exports = Identifier;