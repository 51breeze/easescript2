const Stack = require("../Stack");
const Utils = require("../Utils");
class SwitchCase  extends Stack {

   constructor(compilation,node,scope,parentNode,parentStack)
   { 
      super(compilation,node,scope,parentNode,parentStack);
      const stack = this.getParentStackByName("FunctionExpression");
      this.awaitLabelIndex = ++stack.awaitCount;
      this.condition = Utils.createStack( compilation, node.test, scope, node,this );
      this.consequent = node.consequent.map( item=>Utils.createStack( compilation, item, scope, node,this ) );
      if( this.hasAwait ){
      }
   }

   parser(syntax){
      this.consequent.forEach( item=>item.parser(syntax) );
   }
   
   emit(syntax){
       const condition = this.condition && this.condition.emit(syntax);
       const consequent = this.consequent.map( item=>item.emit(syntax) ).join("\n");
       if( this.hasAwait ){
            const labelIndex = this.awaitLabelIndex;
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