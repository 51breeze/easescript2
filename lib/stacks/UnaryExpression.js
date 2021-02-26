const Utils = require("../Utils");
const Expression = require("./Expression");
class UnaryExpression extends Expression {
    constructor(compilation,node,scope,parentNode,parentStack){ 
        super(compilation,node,scope,parentNode,parentStack);
        this.isUnaryExpression= true;
        this.argument = Utils.createStack( compilation, node.argument, scope, node,this );
    }
    description(){
        return this;
    }
    parser(syntax){
        return this.argument.parser(syntax);
    }
    type(){
        return this.argument.type();
    }
}

module.exports = UnaryExpression;