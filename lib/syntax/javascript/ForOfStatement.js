const Syntax = require("./Syntax");
class ForOfStatement extends Syntax{
    emit(syntax){
        const left = this.stack.left.emit(syntax);
        const right = this.stack.right.emit(syntax);
        const body = this.body.stack ? this.stack.body.emit(syntax) : null;
        if( !body ){
            return this.semicolon(`for(${left} of ${right})`);
        }
        return `for(${left} of ${right}){${body}}`;
    }
}

module.exports = ForOfStatement;