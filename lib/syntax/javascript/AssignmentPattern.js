const Syntax = require("./Syntax");
class AssignmentPattern extends Syntax{
    emit( syntax ){
        const left = this.stack.left.emit(syntax);
        const right = this.stack.right.emit(syntax);
        return `${left}=${right}`;
    }
}
module.exports = AssignmentPattern;