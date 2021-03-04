const Syntax = require("./Syntax");
class Identifier extends Syntax{
     emit(syntax){
          const desc = this.stack.description(syntax);
          if( desc.isModule){
               desc.used = true;
          }
          return this.stack.value();
     }
}
module.exports = Identifier;