const Syntax = require("./Syntax");
class InterfaceDeclaration extends Syntax{
   emit(syntax){
      const body = this.stack.body.map( item=>item.emit(syntax) ).join("\n");
      return body;
   }
}

module.exports = InterfaceDeclaration;