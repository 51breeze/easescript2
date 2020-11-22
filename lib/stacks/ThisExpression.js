const Stack = require("../Stack");
const Utils = require("../Utils");
class ThisExpression  extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
    }

    description(){
        return this.scope.define( this.value() );
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