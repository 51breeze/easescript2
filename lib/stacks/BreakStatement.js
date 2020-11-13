const Stack = require("../Stack");
const Utils = require("../Utils");
class BreakStatement extends Stack{

    constructor(module,node,scope,parent)
    {
        super(module,node,scope,parent);
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

module.exports = BreakStatement;