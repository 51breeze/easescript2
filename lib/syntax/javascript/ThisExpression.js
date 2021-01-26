const Syntax = require("./Syntax");
class ThisExpression  extends Syntax {
    emit(syntax){
        let scope = this.scope.getScopeByType("function");
        return scope.isArrow ? scope.getArrowThisName() : `this`;
    }
}

module.exports = ThisExpression;