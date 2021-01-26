const Syntax = require("./Syntax");
class DoWhileStatement extends Syntax{
   emit( syntax ){
      const condition =  this.stack.condition.emit(syntax);
      const body =  this.stack.body.emit(syntax);
      const indent = this.getIndent();
      return `${indent}do{\r\n${body}\r\n}while(${condition});`;
   }
}

module.exports = DoWhileStatement;