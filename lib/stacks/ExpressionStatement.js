const Stack = require("../Stack");
const Utils = require("../Utils");
class ExpressionStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isExpressionStatement= true;
        this.expression = Utils.createStack(compilation,node.expression,scope,node,this);
    }
    definition(){
        return this;
    }
    throwError(message){
        this.expression.throwError(message);
    }

    throwWarn(message){
        this.expression.throwWarn(message);
    }

    reference(){
        return this.expression.reference();
    }

    referenceItems(){
        return this.expression.referenceItems();
    }

    description(){
        return this.expression.description();
    }

    parser(grammar){
        this.expression.parser(grammar);
    }

    value(){
        return this.expression.value();
    }

    raw(){
        return this.expression.raw();
    }
}

module.exports = ExpressionStatement;