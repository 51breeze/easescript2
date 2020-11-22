const Stack = require("../Stack");
const Utils = require("../Utils");
const FunctionExpression = require("./FunctionExpression");
const FunctionScope = require("../scope/FunctionScope");
class ArrowFunctionExpression extends FunctionExpression{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
         super(compilation,node,scope,parentNode,parentStack);
         this.expression = !!node.expression;
         this.isArrowFunction=true;
    }
}

module.exports = ArrowFunctionExpression;