const Stack = require("../Stack");
const Utils = require("../Utils");
class DoWhileStatement extends Stack{

   constructor(compilation,node,scope,parentNode,parentStack)
   {
        super(module,node,scope,parentNode,parentStack);
        this.condition = Utils.createStack(compilation,node.test,scope,node,this);
        this.body = Utils.createStack(compilation,node.body,scope,node,this);
   }

   parser()
   {
      return this.body.parser();
   }

   emit()
   {
       return this.raw();
   }
}

module.exports = DoWhileStatement;