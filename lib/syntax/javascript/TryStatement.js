const Syntax = require("./Syntax");
class TryStatement extends Syntax {
   emit(syntax){
      const name = this.stack.param.emit(syntax);
      const handler=  this.stack.handler.emit(syntax);
      const block  =  this.stack.block.emit(syntax);
      const indent = this.getIndent();
      return `${indent}try{\r\n${block}\r\n${indent}}catch(${name}){\r\n${handler}\r\n${indent}}`;
   }
}

module.exports = TryStatement;