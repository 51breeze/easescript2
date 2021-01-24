const Syntax = require("./Syntax");
class DoWhileStatement extends Syntax{
   emit( syntax ){
      const condition =  this.stack.condition.emit(syntax);
      const body =  this.stack.body.emit(syntax);
      return `do{${body}}while(${condition});`;
   }
}

module.exports = DoWhileStatement;