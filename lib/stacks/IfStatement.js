const Stack = require("../Stack");
const Utils = require("../Utils");
class IfStatement extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isIfStatement = true;
        this.condition = Utils.createStack(compilation,node.test,scope,node,this);
        this.consequent = Utils.createStack(compilation,node.consequent,scope,node,this);
        this.alternate  = Utils.createStack(compilation,node.alternate,scope,node,this);
        let parent = parentStack;
        if( this.hasAwait ){
            while(parent && !parent.isFunctionExpression){
                if( parent.isSwitchStatement ){
                    parent.awaitChildrenNum++;
                    if( this.alternate ){
                        parent.awaitChildrenNum++;
                    }
                    break;
                }
                parent = parent.parentStack;
            }
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
}

module.exports = IfStatement;