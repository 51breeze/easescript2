const Stack = require("../Stack");
const Utils = require("../Utils");
class ExpressionStatement extends Stack{

    constructor(module,node,scope,parentNode)
    {
        super(module,node,scope,parentNode);
        this.expression = Utils.createStack(module,node.expression,scope,node);
   }

   parser()
   {
      return this.expression.parser();
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

module.exports = ExpressionStatement;