const Syntax = require("./Syntax");
class ExpressionStatement extends Syntax{
    emit( syntax ){
        return this.semicolon( this.stack.expression.emit(syntax) );
    }
}
module.exports = ExpressionStatement;