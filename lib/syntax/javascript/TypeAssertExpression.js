const Syntax = require("./Syntax");
class TypeAssertExpression extends Syntax{
     emit(syntax){
          return this.stack.left.emit( syntax );
     }
}
module.exports = TypeAssertExpression;