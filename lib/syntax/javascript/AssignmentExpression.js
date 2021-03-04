const Syntax = require("./Syntax");
class AssignmentExpression extends Syntax{
    emit( syntax ){
        const left = this.stack.left.emit(syntax);
        const right= this.stack.right.emit(syntax);
        const option = this.getSyntaxOption();
        if( option.target === "es5" && desc.kind ==="set" ){
            return `${left}(${right})`;
        }
        return `${left}=${right}`;
    }
}

module.exports = AssignmentExpression;