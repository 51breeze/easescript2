const Stack = require("../Stack");
const Utils = require("../Utils");
class ForInStatement extends Stack{

    constructor(module,node,scope,parentNode)
    {
        super(module,node,scope,parentNode);
        this.left  = Utils.createStack(module,node.left,scope,node);
        this.right = Utils.createStack(module,node.right,scope,node);
        this.body  = Utils.createStack(module,node.body,scope,node);
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

module.exports = ForInStatement;