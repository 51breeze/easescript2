const Syntax = require("./Syntax");
class SwitchStatement  extends Syntax {
   emit(syntax) {
        const stack = this.stack.hasAwait ? this.stack.getParentStackByName("FunctionExpression") : null;
        if( stack ){
            this.stack.awaitNextLabelIndex = this.stack.awaitChildrenNum+stack.awaitCount+2;
        }
        const condition = this.stack.condition.emit(syntax);
        const cases = this.stack.cases.map( item=>item.emit(syntax) ).join("\n");
        const indent = this.getIndent();
        if( stack ){
            const labelIndex = ++stack.awaitCount;
            const expression = [
                `${indent}switch(${condition}){`,
                cases,
                `${indent}}`,
                this.stack.insertBefore.splice(0).join("\r\n"),
                `${indent}case ${labelIndex}:`
            ];
            return expression.join("\r\n");
        }
        return `${indent}switch(${condition}){\r\n${cases}\r\n${indent}}\r\n${this.stack.insertBefore.splice(0).join("\r\n")}`;
   }
}

module.exports = SwitchStatement;