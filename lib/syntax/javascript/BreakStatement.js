const Syntax = require("./Syntax");
class BreakStatement extends Syntax{
   emit( syntax ){
       const switchStack = this.stack.getParentStackByName("SwitchStatement");
       const indent = this.getIndent();
       if( switchStack.hasAwait ){
           return `${indent}return [3, ${switchStack.awaitNextLabelIndex}];`;
       }
       return `${indent}break;`;
   }
}

module.exports = BreakStatement;