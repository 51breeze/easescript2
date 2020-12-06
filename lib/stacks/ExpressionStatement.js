const Stack = require("../Stack");
const Utils = require("../Utils");
class ExpressionStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.expression = Utils.createStack(compilation,node.expression,scope,node,this);
    }

    description(){
        return this.expression.description();
    }

    parser(syntax){
        this.expression.parser(syntax);
    }

    value(){
        return this.expression.value();
    }

    raw(){
        return this.expression.raw(); 
    }

    emit( syntax ){
        return this.expression.emit(syntax);
    }
}

module.exports = ExpressionStatement;