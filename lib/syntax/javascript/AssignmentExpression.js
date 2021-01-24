const Syntax = require("./Syntax");
class AssignmentExpression extends Syntax{
    emit( syntax ){
        const left = this.stack.left.emit(syntax);
        const right= this.stack.right.emit(syntax);
        const desc = this.stack.description();
        if( !desc ){
            this.throwError(`"${this.left.value()}" is not defined.`);
        }
        if( desc.kind ==="const"){
            this.throwError(`"${this.left.value()}" is not writable`);
        }   
        desc.assignment(this.stack.right , this.stack.left);
        if( desc.kind ==="set" ){
            return `${left}(${right})`;
        }
        return `${left}=${right}`;
    }
}

module.exports = AssignmentExpression;