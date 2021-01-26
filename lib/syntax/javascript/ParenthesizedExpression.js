const Syntax = require("./Syntax");
class ParenthesizedExpression extends Syntax{
    emit( syntax ){
        if( this.stack.__value ){
            return this.stack.__value.emit(syntax);
        }
        return this.stack.expression.emit(syntax);
    }
}

module.exports = ParenthesizedExpression;