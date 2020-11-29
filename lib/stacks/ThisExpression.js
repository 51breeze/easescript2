const Stack = require("../Stack");
const Utils = require("../Utils");
const Expression = require("./Expression");
class ThisExpression  extends Expression {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
    }

    description(){
        return this.type();
    }

    type(){
        return this.scope.define( this.value() );
    }

    value(){
        return "this";
    }

    emit(syntax){
        return this.value();
    }
}

module.exports = ThisExpression;