const Syntax = require("./Syntax");
class WhileStatement extends Syntax{
     emit(syntax){
          const condition = this.stack.condition.emit(syntax);
          const body = this.stack.body ? this.stack.body.emit(syntax) : null;
          if( body ){
               return `while(${condition}){${body}}`;
          }
          return `while(${condition});`;
     }
}

module.exports = WhileStatement;