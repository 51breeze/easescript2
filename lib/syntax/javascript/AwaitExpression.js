const Syntax = require("./Syntax");
class AwaitExpression extends Syntax{
     emit(syntax){
          const stack = this.stack.getParentStackByName("FunctionExpression");
          if(!stack.async){
              this.throwError(`'await' expressions are only allowed within async function`);
          }
          return `return [4,${this.stack.argument.emit(syntax)}];\r\n case ${++stack.awaitCount}:\r\n${stack.generatorVarName()}.sent();`;
     }
}

module.exports = AwaitExpression;