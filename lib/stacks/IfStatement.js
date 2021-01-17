const Stack = require("../Stack");
const Utils = require("../Utils");
class IfStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isIfStatement = true;
        this.condition = Utils.createStack(compilation,node.test,scope,node,this);
        this.consequent  = Utils.createStack(compilation,node.consequent,scope,node,this);
        this.alternate  = Utils.createStack(compilation,node.alternate,scope,node,this);
        if( this.hasAwait ){
            const stack = this.getParentStackByName("FunctionExpression");
            if( !this.consequent.hasAwait && this.alternate && this.alternate.hasAwait ){
                this.consequent.awaitLabelIndex = this.alternate.awaitLabelIndex;
                this.alternate.awaitLabelIndex = ++stack.awaitCount;
                this.alternate.awaitItems.forEach( item=>item.awaitLabelIndex++ );
            }
            this.generatorVarName = stack.generatorVarName();
        }
    }

    parser(syntax){
        if( !this.condition ){
            this.throwError("Missing condition");
        }
        this.condition.parser(syntax);
        this.consequent.parser(syntax);
        if( this.alternate ){
            this.alternate.parser(syntax);
        }
    }

    emit(syntax){
        const condition = this.condition.emit(syntax);
        const consequent = this.consequent.emit(syntax);
        const alternate = this.alternate && this.alternate.emit(syntax);
        if(this.hasAwait){
            let stack = this.getParentStackByName("BlockStatement");
            let nextLabel = stack.awaitLabelIndex;
            if( Utils.isStackByName(stack.parentStack,"IfStatement") ){
                nextLabel = stack.parentStack.consequent.awaitLabelIndex-1;
            }else if( Utils.isStackByName(stack.parentStack,"FunctionExpression") ){
                nextLabel = stack.parentStack.awaitLabelIndex;
                if( this.alternate && this.alternate.hasAwait ){
                    nextLabel--;
                }
            }
          
            let labelIndex = this.consequent.awaitLabelIndex;
            if( !alternate ){
                return `if(!${condition})return [3,${labelIndex}];\r\n${consequent}\r\n${this.generatorVarName}.label=${nextLabel};\r\ncase ${labelIndex}:`
            }else{
                const endStack = stack.hasAwait ? `\r\ncase ${nextLabel}:` : '';
                const breakStack = stack.hasAwait ? `\r\nreturn [3,${nextLabel}];` : '';
                if( !this.consequent.hasAwait ){
                    return `if(!${condition})return [3,${labelIndex-1}];\r\n${consequent}${breakStack}\r\ncase ${labelIndex-1}:\r\n${alternate}\r\n${this.generatorVarName}.label=${nextLabel};${endStack}`;
                }
                if( this.alternate.hasAwait ){
                    return `if(!${condition})return [3,${labelIndex}];\r\n${consequent}${breakStack}\r\ncase ${labelIndex}:\r\n${alternate}\r\n${this.generatorVarName}.label=${nextLabel};${endStack}`;
                }
                return `if(!${condition})return [3,${labelIndex}];\r\n${consequent}${breakStack}\r\ncase ${labelIndex}:\r\n${alternate}${endStack}`;
            }
        }
        if( this.alternate ){
            return `if(${condition}){${consequent}}else{${alternate}}`;
        }
        return `if(${condition}){${consequent}}`;
    }
}

module.exports = IfStatement;