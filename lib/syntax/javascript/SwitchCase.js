const Stack = require("../Stack");
const Utils = require("../Utils");
class SwitchCase  extends Stack {

   constructor(compilation,node,scope,parentNode,parentStack)
   { 
      super(compilation,node,scope,parentNode,parentStack);
      this.isSwitchCase=true;
      this.condition = Utils.createStack( compilation, node.test, scope, node,this );
      this.consequent = node.consequent.map( item=>Utils.createStack( compilation, item, scope, node,this ) );
   }

   parser(syntax){
      this.consequent.forEach( item=>item.parser(syntax) );
   }
   
   emit(syntax){
       const condition = this.condition && this.condition.emit(syntax);
       if( this.condition ){
          const refs = this.parentStack.condition.description();
          if( refs.isLiteral && refs.value() != condition ){
            this.condition.throwWarn(`'${refs.value()}' scalar value will not match the conditional statement`)
          }
       }

       let stack = null;
       let labelIndex = null;
       if( this.hasAwait ){
          stack = this.getParentStackByName("FunctionExpression");
          labelIndex = ++stack.awaitCount;
       }
       const consequent = this.consequent.map( item=>item.emit(syntax) ).join("\n");
       if( this.hasAwait ){
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