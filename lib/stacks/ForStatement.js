const Stack = require("../Stack");
const Utils = require("../Utils");
class ForStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.init  = Utils.createStack(compilation,node.init,scope,node,this);
        this.condition = Utils.createStack(compilation,node.test,scope,node,this);
        this.update  = Utils.createStack(compilation,node.update,scope,node,this);
        this.body  = Utils.createStack(compilation,node.body,scope,node,this);
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

module.exports = ForStatement;