const Stack = require("../Stack");
const Utils = require("../Utils");
class IfStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isIfStatement = true;
        this.condition = Utils.createStack(compilation,node.test,scope,node,this);
        this.consequent = Utils.createStack(compilation,node.consequent,scope,node,this);
        this.alternate  = Utils.createStack(compilation,node.alternate,scope,node,this);
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
        const stack = this.hasAwait ? this.getParentStackByName("FunctionExpression") : null;
        let labelIndex = null;
        if( stack ){
            labelIndex= ++stack.awaitCount;
        }
        const alternate = this.alternate && this.alternate.emit(syntax);
        if(stack){
            if( !alternate ){
                return `if(!${condition})return [3,${labelIndex}];\r\n${consequent}\r\n${stack.generatorVarName()}.label=${labelIndex};\r\ncase ${labelIndex}:`
            }else{
                let nextLabel = ++stack.awaitCount;
                const endStack = `\r\ncase ${nextLabel}:` ;
                const breakStack =  `\r\nreturn [3,${nextLabel}];`;
                return `if(!${condition})return [3,${labelIndex}];\r\n${consequent}${breakStack}\r\ncase ${labelIndex}:\r\n${alternate}\r\n${stack.generatorVarName()}.label=${nextLabel};${endStack}`;
            }
        }
        if( this.alternate ){
            return `if(${condition}){${consequent}}else{${alternate}}`;
        }
        return `if(${condition}){${consequent}}`;
    }
}

module.exports = IfStatement;