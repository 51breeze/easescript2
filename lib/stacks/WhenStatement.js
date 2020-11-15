const Stack = require("../Stack");
const Utils = require("../Utils");
class WhenStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
         super(compilation,node,scope,parentNode,parentStack);
         this.condition = Utils.createStack(compilation,node.test,scope,node,this);
         this.consequent = Utils.createStack(compilation,node.consequent,scope,node,this);
         this.alternate = Utils.createStack(compilation,node.alternate,scope,node,this);
   }

   parser()
   {
      this.consequent.parser();
      this.alternate.parser();
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