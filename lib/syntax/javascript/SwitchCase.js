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
       const consequent = this.stack.consequent.map( item=>item.emit(syntax) ).join("\n");
       if( this.stack.hasAwait ){
            this.parentStack.dispatcher("insertBefore", `case ${labelIndex}:\r\n${consequent}`);
            if( condition ){
               return `case ${condition} :\r\n return [3,${labelIndex}];\r\n`;
            }
            return `default:\r\n return [3,${labelIndex}];\r\n`;
       }
       if( condition ){
            return `case ${condition} :\n ${consequent}`;
       }
       return `default:\n ${consequent}`;
   }
}

module.exports = SwitchCase;