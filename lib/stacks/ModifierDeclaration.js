const Stack = require("../Stack");
const Utils = require("../Utils");
class ModifierDeclaration extends Stack{

    constructor(module,node,scope,parentNode)
    {
        super(module,node,scope,parentNode);
    }
    
   parser()
   {
      return;
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

module.exports = ModifierDeclaration;