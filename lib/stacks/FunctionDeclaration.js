const Utils = require("../Utils");
const FunctionExpression = require("./FunctionExpression");
class FunctionDeclaration extends FunctionExpression{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isFunctionDeclaration= true;
        this.key = Utils.createStack(compilation,node.id,scope,node,this);
        scope.define( this.key.value(), this );
        if( node.type==="FunctionDeclaration" ){
            this.scope.define("this", compilation.getType("Object") );
        }
    }
    emit(syntax){
        return syntax.builder(this,"FunctionExpression");
    }
}

module.exports = FunctionDeclaration;