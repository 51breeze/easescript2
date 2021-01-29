const Syntax = require("./Syntax");
class SwitchStatement  extends Syntax {
   emit(syntax) {
        const insert = [];
        this.stack.removeAllListeners("insert")
        this.stack.addListener("insert",(content)=>{
            if( content ){
                insert.push(content);
            }
        });
        const stack = this.stack.hasAwait ? this.stack.getParentStackByName("FunctionExpression") : null;
        if( stack ){
            this.stack.awaitNextLabelIndex = this.stack.awaitChildrenNum+stack.awaitCount+3;
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
                `${indent}${stack.generatorVarName()}.label=${labelIndex};`,
                insert.join("\r\n"),
                `${indent.substr(1)}case ${labelIndex}:`
            ];
            return expression.join("\r\n");
        }
        return `${indent}switch(${condition}){\r\n${cases}\r\n${indent}}`;
   }
}

module.exports = SwitchStatement;