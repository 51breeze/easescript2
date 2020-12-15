const Stack = require("../Stack");
const Utils = require("../Utils");
class ParenthesizedExpression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.expression = Utils.createStack(compilation,node.expression,scope,node,this);
        this.value = Utils.createStack(compilation,node.value,scope,node,this);
    }

    description(){
        return this.expression.description();
    }

    parser(syntax){
        this.expression.parser(syntax);
    }

    value(){
        if( this.value ){
            return this.value.value();
        }
        return this.expression.value();
    }

    raw(){
        if( this.value ){
            return this.value.raw();
        }
        return this.expression.raw(); 
    }

    emit( syntax ){
        if( this.value ){
            return this.value.emit(syntax);
        }
        return this.expression.emit(syntax);
    }
}

module.exports = ParenthesizedExpression;