const Stack = require("../Stack");
const Utils = require("../Utils");
class ExpressionStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.expression = Utils.createStack(compilation,node.expression,scope,node,this);
   }

   description(){
       return this.expression.description();
   }

   parser(syntax)
   {
      return this.expression.parser(syntax);
   }

   emit( syntax )
   {
       return this.expression.emit(syntax);
   }
}

module.exports = ExpressionStatement;