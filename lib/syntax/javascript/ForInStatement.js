const Syntax = require("./Syntax");
class ForInStatement extends Syntax{
   emit( syntax ){
       const left = this.stack.left.emit(syntax);
       const right = this.stack.right.emit(syntax);
       const body = this.stack.body ? this.stack.body.emit(syntax) : null;
       const indent = this.getIndent();
       if( !this.stack.body ){
          return this.semicolon(`${indent}for(${left} in ${right})`);
       }
       if( body ){
          return `${indent}for(${left} in ${right}){\r\n${body}\r\n${indent}}`;
       }
       return `${indent}for(${left} in ${right}){\r\n${indent}}`;
   }
}

module.exports = ForInStatement;