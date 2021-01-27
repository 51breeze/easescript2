const Syntax = require("./Syntax");
class SwitchCase  extends Syntax {
   emit(syntax){
       const condition = this.stack.condition && this.stack.condition.emit(syntax);
       if( this.stack.condition ){
          const refs = this.parentStack.condition.description();
          if( refs.isLiteral && refs.value() != condition ){
            this.stack.condition.throwWarn(`'${refs.value()}' scalar value will not match the conditional statement`)
          }
       }

       let stack = null;
       let labelIndex = null;
       if( this.stack.hasAwait ){
          stack = this.stack.getParentStackByName("FunctionExpression");
          labelIndex = ++stack.awaitCount;
       }
       const consequent = this.stack.consequent.map( item=>item.emit(syntax) ).join("\r\n");
       const indent = this.getIndent();
       if( this.stack.hasAwait ){
            this.parentStack.dispatcher("insertBefore", `${indent}case ${labelIndex}:\r\n${consequent}`);
            if( condition ){
               return `${indent}case ${condition} :\r\n`+this.semicolon(`return [3,${labelIndex}]`);
            }
            return `${indent}default:\r\n`+this.semicolon(`return [3,${labelIndex}]`);
       }
       if( condition ){
            return `${indent}case ${condition} :\r\n${consequent}`;
       }
       return `${indent}default:\r\n${consequent}`;
   }
}

module.exports = SwitchCase;