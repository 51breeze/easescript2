const Syntax = require("./Syntax");
class WhileStatement extends Syntax{
     emit(syntax){
          const condition = this.stack.condition.emit(syntax);
          const body = this.stack.body ? this.stack.body.emit(syntax) : null;
          const indent = this.getIndent();
          if( this.stack.body ){
               return `${indent}while(${condition}){\r\n${body}\r\n${indent}}`;
          }
          return `${indent}while(${condition});`;
     }
}

module.exports = WhileStatement;