const Syntax = require("./Syntax");
class InterfaceDeclaration extends Syntax{
   emit(syntax){
      return this.stack.body.map( item=>item.emit(syntax) ).join("\n");
   }
}

module.exports = InterfaceDeclaration;