const Stack = require("../Stack");
const Utils = require("../Utils");
const FunctionExpression = require("./FunctionExpression");
class FunctionDeclaration extends FunctionExpression{

    constructor(module,node,scope,parentNode,parentStack)
    {
        super(module,node,scope,parentNode,parentStack);
        this.key = Utils.createStack(module,node.id,scope,node,this);
        scope.define( this.key.value(), this );
   }
}

module.exports = FunctionDeclaration;