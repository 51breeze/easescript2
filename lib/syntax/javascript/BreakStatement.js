const Syntax = require("./Syntax");
class BreakStatement extends Syntax{
   emit( syntax ){
       const switchStack = this.stack.getParentStackByName("SwitchStatement");
       if( switchStack.hasAwait ){
           return `return [3, ${switchStack.awaitNextLabelIndex}];`;
       }
       return `break;`;
   }
}

module.exports = BreakStatement;