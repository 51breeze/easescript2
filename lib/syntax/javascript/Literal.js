const Syntax = require("./Syntax");
class Literal extends Syntax{
     emit(syntax){
          return this.stack.raw();
     }
}
module.exports = Literal;