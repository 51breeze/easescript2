const Syntax = require("./Syntax");
class SwitchStatement  extends Syntax {
   emit(syntax) {
        const stack = this.stack.hasAwait ? this.stack.getParentStackByName("FunctionExpression") : null;
        if( stack ){
            this.stack.awaitNextLabelIndex = this.stack.awaitChildrenNum+stack.awaitCount+2;
        }
        const condition = this.stack.condition.emit(syntax);
        const cases = this.stack.cases.map( item=>item.emit(syntax) ).join("\n");
        const indent = this.getIndent(2);
        if( stack ){
            const labelIndex = ++stack.awaitCount;
            return `${indent}switch(${condition}){\r\n${cases}\r\n${indent}}\r\n${this.stack.insertBefore.join("\r\n")}\r\n${indent}case ${labelIndex}:\r\n`;
        }
        return `${indent}switch(${condition}){\r\n${cases}\r\n${indent}}\r\n${this.stack.insertBefore.join("\r\n")}`;
   }
}

module.exports = SwitchStatement;