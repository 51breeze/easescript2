const Stack = require("../Stack");
const Utils = require("../Utils");
class ParenthesizedExpression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isParenthesizedExpression= true;
        this.expression = Utils.createStack(compilation,node.expression,scope,node,this);
        this.__value = Utils.createStack(compilation,node.value,scope,node,this);
    }

    reference(){
        if( this.__value ){
            return this.__value.reference();
        }
        return this.expression.reference();
    }

    type(){
        return this.expression.type();
    }

    description(){
        if( this.__value ){
            return this.__value.description();
        }
        return this.expression.description();
    }

    parser(syntax){
        if( this.__value ){
            return this.__value.parser(syntax);
        }
        this.expression.parser(syntax);
    }

    value(){
        if( this.__value ){
            return this.__value.value();
        }
        return this.expression.value();
    }

    raw(){
        if( this.__value ){
            return this.__value.raw();
        }
        return this.expression.raw(); 
    }
}

module.exports = ParenthesizedExpression;