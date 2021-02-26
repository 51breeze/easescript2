const Expression = require("./Expression");
class ThisExpression  extends Expression {
    constructor(compilation,node,scope,parentNode,parentStack){ 
        super(compilation,node,scope,parentNode,parentStack);
        this.isThisExpression= true;
        node.name = "this";
    }
    reference(){
        return this;
    }
    description(){
        return this;
    }
    referenceItems(){
        return [this];
    }
    type(){
        return this.scope.define( this.value() );
    }
    value(){
        return `this`;
    }
    raw(){
        return `this`; 
    }
    check(){
        const desc = this.type();
        if( !desc ){
            this.throwError(`"${this.raw()}" is not defined.`);
        }
    }
    parser(){
        this.check();
    }
}

module.exports = ThisExpression;