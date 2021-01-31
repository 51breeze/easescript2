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
            let topIndent = this.getIndent( this.scope.asyncParentScopeOf.level+3 );
            const expression = [
                `${topIndent}\tif(!${condition})return [3,${labelIndex}];`,
                consequent,
            ];
            if( !alternate ){
                expression.push(`${topIndent}\t${stack.generatorVarName()}.label=${labelIndex};`);
                expression.push(`${topIndent}case ${labelIndex}:`);
                return expression.join("\r\n");
            }else{
                let nextLabel = ++stack.awaitCount;
                expression.push(`${topIndent}\treturn [3,${nextLabel}];`);
                expression.push(`${topIndent}case ${labelIndex}:`);
                expression.push(alternate);
                expression.push(`${topIndent}\t${stack.generatorVarName()}.label=${nextLabel};`);
                expression.push(`${topIndent}case ${nextLabel}:`);
                return  expression.join("\r\n");
            }
        }
        if( this.stack.alternate ){
            return `${indent}if(${condition}){\r\n${consequent}\r\n${indent}}else{\r\n${alternate}\r\n${indent}}`;
        }
        return `${indent}if(${condition}){\r\n${consequent}\r\n${indent}}`;
    }
}

module.exports = IfStatement;