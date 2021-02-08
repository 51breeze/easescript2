const Syntax = require("./Syntax");
class ExpressionStatement extends Syntax{
    emit( syntax ){
        this.stack.isSyntaxRemoved = false;
        const value = this.stack.expression.emit(syntax);
        if( this.stack.isSyntaxRemoved ){
            return null;
        }
        if( this.stack.hasAwait ){
           return value;
        }
        return this.semicolon( value );
    }
}
module.exports = ExpressionStatement;