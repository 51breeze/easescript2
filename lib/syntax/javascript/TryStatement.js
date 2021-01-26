const Syntax = require("./Syntax");
class TryStatement extends Syntax {
   emit(syntax){
      const name = this.stack.param.emit(syntax);
      const handler=  this.stack.handler.emit(syntax);
      const block  =  this.stack.block.emit(syntax);
       return `try{${block}}catch(${name}){${handler}}`;
   }
}

module.exports = TryStatement;