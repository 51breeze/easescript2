const Stack = require("../Stack");
const Utils = require("../Utils");
class BlockStatement extends Stack{

    constructor(module,node,scope,parent)
    {
         super(module,node,scope,parent);
         this.body = Utils.createStack( module, node.body, scope, node );
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

module.exports = BlockStatement;