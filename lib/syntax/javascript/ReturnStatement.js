const Syntax = require("./Syntax");
class ReturnStatement extends Syntax{
    emit(syntax){
        const argument = this.stack.argument ? this.stack.argument.emit(syntax) : null;
        if( this.stack.fnScope.async ){
            return this.semicolon(`return [2, ${argument}]`);
        }
        return this.semicolon(`return ${argument}`);
    }
}

module.exports = ReturnStatement;