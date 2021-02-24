const Syntax = require("./Syntax");
class ForOfStatement extends Syntax{
    emit(syntax){
        const left = this.stack.left.emit(syntax);
        const name = this.stack.left.value();
        const right = this.stack.right.emit(syntax);
        const body = this.stack.body ? this.stack.body.emit(syntax) : null;
        const indent = this.getIndent();
        const refs = this.scope.generateVarName("a");
        const condition = `${left},${refs}=System.getIterator(${right});(${name}=${refs}.next()) && !${name}.done && (${name}=${refs}.value);`;
        if( !this.stack.body ){
            return this.semicolon(`${indent}for(${condition})`);
        }
        if( body ){
            return `${indent}for(${condition}){\r\n${body}\r\n${indent}}`;
        }
        return `${indent}for(${condition}){\r\n${indent}}`;
    }
}

module.exports = ForOfStatement;