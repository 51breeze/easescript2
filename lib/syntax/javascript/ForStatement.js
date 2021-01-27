const Syntax = require("./Syntax");
class ForStatement extends Syntax{
    emit(syntax){
        const init = this.stack.init.emit(syntax);
        const condition = this.stack.condition.emit(syntax);
        const update = this.stack.update.emit(syntax);
        const body = this.stack.body ? this.stack.body.emit(syntax) : null;
        const indent = this.getIndent();
        if( !this.stack.body ){
            return this.semicolon(`${indent}for(${init};${condition};${update})`);
        }
        if( body ){
            return `${indent}for(${init};${condition};${update}){\r\n${body}\r\n${indent}}`;
        }
        return `${indent}for(${init};${condition};${update}){\r\n${indent}}`;
    }
}

module.exports = ForStatement;