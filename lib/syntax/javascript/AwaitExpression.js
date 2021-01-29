const Syntax = require("./Syntax");
class AwaitExpression extends Syntax{
     emit(syntax){
          const stack = this.stack.getParentStackByName("FunctionExpression");
          if(!stack.async){
              this.throwError(`'await' expressions are only allowed within async function`);
          }
          const indent = this.getIndent();
          const expression = [
               this.semicolon(`return [4,${this.stack.argument.emit(syntax)}]`),
               `${indent.substr(1)}case ${++stack.awaitCount}:`,
               this.semicolon(`${stack.generatorVarName()}.sent()`)
          ];
          return expression.join("\r\n");
     }
}

module.exports = AwaitExpression;