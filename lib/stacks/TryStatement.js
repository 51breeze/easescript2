const Stack = require("../Stack");
const Utils = require("../Utils");
class TryStatement extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.acceptType = Utils.createStack( compilation,node.handler.param.acceptType, scope, node,this );
        this.handler = Utils.createStack( compilation,node.handler.body, scope, node,this );
        this.block = Utils.createStack( compilation,node.block, scope, node,this );
   }

   parser()
   {
      this.handler.parser();
      this.block.parser();
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