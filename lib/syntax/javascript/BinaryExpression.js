const Syntax = require("./Syntax");
class BinaryExpression extends Syntax{
     emit( syntax ){
          const left = this.left.emit(syntax);
          const right = this.right.emit(syntax);
          const operator = this.node.operator;
          return `${left} ${operator} ${right}`;
     }
}
module.exports = BinaryExpression;