const Stack = require("../Stack");
const Utils = require("../Utils");
class TypeDefinition extends Stack {

    constructor(module,node,scope,parentNode)
    { 
        super(module,node,scope,parentNode);
   }

   parser()
   {
      
   }

   raw()
   {
       return this.node.name;
   }

   emit()
   {
       return this.raw();
   }
}

module.exports = TypeDefinition;