const Stack = require("../Stack");
const Utils = require("../Utils");
class ParenthesizedExpression extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isParenthesizedExpression= true;
        this.expression = Utils.createStack(compilation,node.expression,scope,node,this);
        this.__value = Utils.createStack(compilation,node.value,scope,node,this);
    }
    definition(){
        return null;
    }
    reference(){
        if( this.__value ){
            return this.__value.reference();
        }
        return this.expression.reference();
    }
    referenceItems(){
        if( this.__value ){
            return this.__value.referenceItems();
        }
        return this.expression.referenceItems();
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
    parser(grammar){
        if( this.__value ){
            return this.__value.parser(grammar);
        }
        this.expression.parser(grammar);
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