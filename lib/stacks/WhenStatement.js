const Stack = require("../Stack");
const Utils = require("../Utils");
class WhenStatement extends Stack{

    constructor(module,node,scope,parentNode)
    {
         super(module,node,scope,parentNode);
         this.condition = Utils.createStack(module,node.test,scope,node);
         this.consequent = Utils.createStack(module,node.consequent,scope,node);
         this.alternate = Utils.createStack(module,node.alternate,scope,node);
   }

   parser()
   {
      return this.body.parser();
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

module.exports = WhenStatement;