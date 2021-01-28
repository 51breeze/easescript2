const Syntax = require("./Syntax");
class IfStatement extends Syntax{
    emit(syntax){
        const condition = this.stack.condition.emit(syntax);
        const consequent = this.stack.consequent.emit(syntax);
        const stack = this.stack.hasAwait ? this.stack.getParentStackByName("FunctionExpression") : null;
        let labelIndex = null;
        if( stack ){
            labelIndex= ++stack.awaitCount;
        }
        const alternate = this.stack.alternate && this.stack.alternate.emit(syntax);
        let indent = this.getIndent();
        if(stack){
            const expression = [
                `${indent}if(!${condition})return [3,${labelIndex}];`,
                consequent,
            ];
            if( !alternate ){
                expression.push(`${indent}${stack.generatorVarName()}.label=${labelIndex};`);
                expression.push(`${indent}case ${labelIndex}:`);
                return expression.join("\r\n");
            }else{
                let nextLabel = ++stack.awaitCount;
                expression.push(`${indent}return [3,${nextLabel}];`);
                expression.push(`${indent}case ${labelIndex}:`);
                expression.push(alternate);
                expression.push(`${indent}${stack.generatorVarName()}.label=${nextLabel};`);
                expression.push(`${indent}case ${nextLabel}:`);
                return  expression.join("\r\n");
            }
        }
        if( this.stack.alternate ){
            return `${indent}if(${condition}){\r\n${consequent}\r\n}else{\r\n${alternate}\r\n${indent}}`;
        }
        return `${indent}if(${condition}){\r\n${consequent}\r\n${indent}}`;
    }
}

module.exports = IfStatement;