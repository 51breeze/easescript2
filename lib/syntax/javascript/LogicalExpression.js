const Syntax = require("./Syntax");
class LogicalExpression extends Syntax{
     emit(syntax){
          const left= this.stack.left.emit( syntax );
          const right= this.stack.right.emit( syntax );
          const operator = this.stack.node.operator;
          return `${left} ${operator} ${right}`;
     }
}

module.exports = LogicalExpression;