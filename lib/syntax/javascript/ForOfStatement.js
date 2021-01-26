const Syntax = require("./Syntax");
class ForOfStatement extends Syntax{
    emit(syntax){
        const left = this.stack.left.emit(syntax);
        const right = this.stack.right.emit(syntax);
        const body = this.stack.body ? this.stack.body.emit(syntax) : null;
        if( !body ){
            return this.semicolon(`for(${left} of ${right})`);
        }
        const indent = this.getIndent();
        return `${indent}for(${left} of ${right}){\r\n${body}\r\n${indent}}`;
    }
}

module.exports = ForOfStatement;