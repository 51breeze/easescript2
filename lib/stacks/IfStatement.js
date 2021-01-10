const Stack = require("../Stack");
const Utils = require("../Utils");
class IfStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isIfStatement = true;
        this.condition = Utils.createStack(compilation,node.test,scope,node,this);
        this.consequent  = Utils.createStack(compilation,node.consequent,scope,node,this);
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
        const alternate = this.alternate && this.alternate.emit(syntax);
        if(this.hasAwait){
            const stack = this.getParentStackByName("FunctionExpression");
            const children = this.consequent.childrenStack;
            const index = children.findIndex( item=>item.isAwaitExpression )
            if( index >= 0 && index < children.length && children[index+1] ){
                 const next = children[index+1];
                 if( Utils.isStackByName(next,"ExpressionStatement") ){
                    return `if(!${condition})return [3,${stack.awaitCount}];\r\n${consequent} \r\ncase ${++stack.awaitCount}:\r\n`;
                 }
            }
            return `if(!${condition})return [3,${stack.awaitCount}];\r\n${consequent}`;
        }
        if( alternate ){
            return `if(${condition}){${consequent}}else{${alternate}}`;
        }
        return `if(${condition}){${consequent}}`;
    }
}

module.exports = IfStatement;