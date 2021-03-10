const Utils = require("../Utils");
const Expression = require("./Expression");
class UpdateExpression extends Expression {
    constructor(compilation,node,scope,parentNode,parentStack){ 
        super(compilation,node,scope,parentNode,parentStack);
        this.isUpdateExpression= true;
        this.argument = Utils.createStack( compilation, node.argument, scope, node,this );
    }
    definition(){
        return null;
    }
    description(){
        return this;
    }
    parser(grammar){
        return this.argument.parser(grammar);
    }
    type(){
        return this.argument.type();
    }
}

module.exports = UpdateExpression;