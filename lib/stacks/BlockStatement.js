const Stack = require("../Stack");
const Utils = require("../Utils");
const BlockScope = require("../scope/BlockScope");
class BlockStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        const type = parentNode.type;
        if( parentNode && !(type ==="FunctionDeclaration" || type==="FunctionExpression" || type==="ArrowFunctionExpression" || parentStack.isWhenStatement) ){
            scope = new BlockScope(scope);
        }
        super(compilation,node,scope,parentNode,parentStack);
        this.isBlockStatement= true;
        this.body = node.body.map( (item)=> Utils.createStack( compilation, item, scope, node, this ));
    }

    parser(grammar){
        this.body.forEach( item=>item.parser(grammar) );
    }
}

module.exports = BlockStatement;