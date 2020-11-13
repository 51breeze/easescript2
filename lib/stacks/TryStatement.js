const Stack = require("../Stack");
const Utils = require("../Utils");
class TryStatement extends Stack {

    constructor(module,node,scope,parentNode)
    { 
        super(module,node,scope,parentNode);
        this.acceptType = Utils.createStack( module,node.handler.param.acceptType, scope, node );
        this.handler = Utils.createStack( module,node.handler.body, scope, node );
        this.block = Utils.createStack( module,node.block, scope, node );
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

module.exports = TryStatement;