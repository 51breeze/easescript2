const Syntax = require("./Syntax");
class Identifier extends Syntax{
     emit(syntax){
          return this.stack.value();
     }
}
module.exports = Identifier;