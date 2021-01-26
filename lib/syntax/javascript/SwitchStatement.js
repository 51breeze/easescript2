const Syntax = require("./Syntax");
class SwitchStatement  extends Syntax {
   emit(syntax) {
        const stack = this.stack.hasAwait ? this.stack.getParentStackByName("FunctionExpression") : null;
        this.awaitNextLabelIndex = stack ? this.stack.awaitChildrenNum+stack.awaitCount+2 : 0;
        const condition = this.stack.condition.emit(syntax);
        const cases = this.stack.cases.map( item=>item.emit(syntax) ).join("\n");
        if( stack ){
            const labelIndex = ++stack.awaitCount;
            return `switch(${condition}){${cases}}\r\n${this.stack.insertBefore.join("\r\n")}\r\ncase ${labelIndex}:`;
        }
        return `switch(${condition}){${cases}}\r\n${this.stack.insertBefore.join("\r\n")}`;
   }
}

module.exports = SwitchStatement;