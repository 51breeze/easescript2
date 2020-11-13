const Stack = require("../Stack");
const Utils = require("../Utils");
class Identifier extends Stack{

    constructor(module,node,scope,parentNode)
    {
        super(module,node,scope,parentNode);
   }

   parser(){

   }

   raw(){
       return this.node.name;
   }

   emit(){
       return this.node.name;
   }
}

module.exports = Identifier;