const Syntax = require("./Syntax");
class BinaryExpression extends Syntax{
     emit( syntax ){
          const left = this.stack.left.emit(syntax);
          const right = this.stack.right.emit(syntax);
          const operator = this.stack.node.operator;
          if( operator ==="is" || operator==="instanceof" ){
               const type = this.stack.right.type();
               type.used = true;
               if( operator!=="instanceof" ){
                    if( type.isClass){
                         return `${left} instanceof ${right}`;
                    }
                    return `System.is(${left},${this.stack.right.value()})`;
               }
          }
          return `${left} ${operator} ${right}`;
     }
}
module.exports = BinaryExpression;