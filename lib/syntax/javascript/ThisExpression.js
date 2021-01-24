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
    emit(syntax){
        this.check();
        let scope = this.scope.getScopeByType("function");
        const name = scope.isArrow ? scope.getArrowThisName() : null;
        return name || syntax.makeThisExpression(this.scope);
    }
}

module.exports = ThisExpression;