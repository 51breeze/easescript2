const Syntax = require("./Syntax");
class MethodDefinition extends Syntax{
    emit(syntax){
        return this.expression.emit(syntax);
    }
}

module.exports = MethodDefinition;