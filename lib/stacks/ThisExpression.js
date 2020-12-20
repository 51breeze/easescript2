const Expression = require("./Expression");
class ThisExpression  extends Expression {
    constructor(compilation,node,scope,parentNode,parentStack){ 
        super(compilation,node,scope,parentNode,parentStack);
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
    parser(){
        const desc = this.type();
        if( !desc ){
            this.throwError(`"${this.raw()}" is not defined.`);
        }
    }
    emit(syntax){
        let scope = this.scope.getScopeByType("function");
        const name = scope.isArrow ? scope.getArrowThisName() : null;
        return name || syntax.makeThisExpression(this.scope);
    }
}

module.exports = ThisExpression;