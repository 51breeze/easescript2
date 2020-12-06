const Stack = require("../Stack");
const Utils = require("../Utils");
const Expression = require("./Expression");
class ThisExpression  extends Expression {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
    }

    description(){
        return this.scope.define( this.value() );
    }

    type(){
        return this.description();
    }

    value(){
        return `this`;
    }
    raw(){
        return `this`; 
    }
    parser(){
        const desc = this.description();
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