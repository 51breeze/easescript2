const Syntax = require("./Syntax");
class AwaitExpression extends Syntax{
     emit(syntax){
          const stack = this.stack.getParentStackByName("FunctionExpression");
          const indent = this.getIndent( this.scope.asyncParentScopeOf.level+3 );
          const expression = [
               `${indent}\treturn [4,${this.stack.argument.emit(syntax)}];`,
               `${indent}case ${++stack.awaitCount}:`,
               `${indent}\t${stack.generatorVarName()}.sent();`
          ];
          return expression.join("\r\n");
     }
}

module.exports = AwaitExpression;