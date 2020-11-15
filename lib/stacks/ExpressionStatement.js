const Stack = require("../Stack");
const Utils = require("../Utils");
class ExpressionStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.expression = Utils.createStack(compilation,node.expression,scope,node,this);
   }

   parser()
   {
      return this.expression.parser();
   }

   emit()
   {
       return this.raw();
   }
}

module.exports = ExpressionStatement;