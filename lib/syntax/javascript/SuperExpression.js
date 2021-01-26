const Syntax = require("./Syntax");
class SuperExpression  extends Syntax {
    emit(syntax){
        const parent = this.compilation.module.extends[0];
        const fnScope = this.scope.getScopeByType("function");
        if( fnScope.isConstructor && !this.parentStack.isMemberExpression ){
           return `${parent.id}.prototype.constructor`;
        }
        return `${parent.id}.prototype`;
    }
}

module.exports = SuperExpression;