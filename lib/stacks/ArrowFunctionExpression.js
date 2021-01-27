const FunctionExpression = require("./FunctionExpression");
class ArrowFunctionExpression extends FunctionExpression{
    constructor(compilation,node,scope,parentNode,parentStack)
    {
         super(compilation,node,scope,parentNode,parentStack);
         this.isArrowFunctionExpression=true;
         this.isExpression = !!node.expression;
         this.isArrowFunction=true;
         this.scope.isArrow = true; 
         this.scope.isExpression = this.expression;
    }
}

module.exports = ArrowFunctionExpression;