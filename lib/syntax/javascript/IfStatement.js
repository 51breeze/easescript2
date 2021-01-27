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
        const indent = this.getIndent();
        if(stack){
            if( !alternate ){
                return `${indent}if(!${condition})return [3,${labelIndex}];\r\n${consequent}\r\n${stack.generatorVarName()}.label=${labelIndex};\r\ncase ${labelIndex}:`
            }else{
                let nextLabel = ++stack.awaitCount;
                const endStack = `case ${nextLabel}:` ;
                const breakStack = `return [3,${nextLabel}];`;
                return `${indent}if(!${condition})return [3,${labelIndex}];\r\n${consequent}${breakStack}\r\ncase ${labelIndex}:\r\n${alternate}\r\n${stack.generatorVarName()}.label=${nextLabel};${endStack}`;
            }
        }
        if( this.stack.alternate ){
            return `${indent}if(${condition}){\r\n${consequent}\r\n}else{\r\n${alternate}\r\n${indent}}`;
        }
        return `${indent}if(${condition}){\r\n${consequent}\r\n${indent}}`;
    }
}

module.exports = IfStatement;