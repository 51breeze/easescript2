const Stack = require("../Stack");
const Utils = require("../Utils");
const FunctionExpression = require("./FunctionExpression");
class FunctionDeclaration extends FunctionExpression{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.key = Utils.createStack(compilation,node.id,scope,node,this);
        scope.define( this.key.value(), this );
        if( node.type==="FunctionDeclaration" ){
            this.scope.define("this", compilation.getType("Object") );
        }
        this.genericType = Utils.createStack(compilation,node.genericType,scope,node,this);
   }
}

module.exports = FunctionDeclaration;