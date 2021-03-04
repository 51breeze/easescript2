const Syntax = require("./Syntax");
class SwitchCase  extends Syntax {
   emit(syntax){
       const condition = this.stack.condition && this.stack.condition.emit(syntax);
       if( this.stack.condition ){
          const refs = this.parentStack.condition.description(this);
          if( refs.isLiteral && refs.value() != condition ){
            this.stack.condition.throwWarn(`'${refs.value()}' scalar value will not match the conditional statement`)
          }
       }

       let stack = null;
       let labelIndex = null;
       if( this.stack.parentStack.hasAwait ){
          stack = this.stack.getParentStackByName("FunctionExpression");
          labelIndex = ++stack.awaitCount;
       }
       const consequent = this.stack.consequent.map( item=>item.emit(syntax) ).join("\r\n");
       const indent = this.getIndent();
       if( this.stack.parentStack.hasAwait ){
            const topIndent = this.getIndent( this.scope.asyncParentScopeOf.level+3);
            const nextLabel = this.stack.hasBreak ? `` : `${topIndent}\t${stack.generatorVarName()}.label=${labelIndex+1};`;
            this.parentStack.dispatcher("insert", `${topIndent}case ${labelIndex}:\r\n${consequent}\r\n${nextLabel}`);
            if( condition ){
               return `${indent}\tcase ${condition} : return [3,${labelIndex}];`;
            }
            return `${indent}\tdefault: return [3,${labelIndex}];`;
       }
       if( condition ){
            return `${indent}case ${condition} :\r\n${consequent}`;
       }
       if( consequent ){
         return `${indent}default:\r\n${consequent}`;
       }
       return `${indent}default:`;
   }
}

module.exports = SwitchCase;