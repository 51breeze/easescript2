const Syntax = require("./Syntax");
class SequenceExpression extends Syntax{
     emit(syntax){
         const expressions = this.stack.expressions.map( item=>item.emit(syntax) );
         return expressions.join(",");
     }
}

module.exports = SequenceExpression;