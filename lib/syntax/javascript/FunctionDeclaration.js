const Syntax = require("./Syntax");
class FunctionDeclaration extends Syntax{
    emit(syntax){
        const indent = this.getIndent();
        return indent+this.stack.emit( syntax );
    }
}

module.exports = FunctionDeclaration;