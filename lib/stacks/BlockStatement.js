const Stack = require("../Stack");
const Utils = require("../Utils");
const BlockScope = require("../scope/BlockScope");
class BlockStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        const type = parentNode.type;
        if( parentNode && !(type ==="FunctionDeclaration" || type==="FunctionExpression" || type==="ArrowFunctionExpression") ){
            scope = new BlockScope(scope);
        }
        super(compilation,node,scope,parentNode,parentStack);
        this.body = node.body.map( item=>Utils.createStack( compilation, item, scope, node, this ) );
    }

    parser(syntax){
        this.body.forEach( item=>item.parser(syntax) );
    }

    emit( syntax ){
        const body = [];
        this.removeAllListeners("insertBefore").addListener("insertBefore",(content)=>{
            if( content ){
                body.push(content);
            }
        });
        this.body.forEach( item=>{
            body.push( item.emit(syntax) );
        });
        return body.filter( item=>!!item ).join("\r\n");
    }
}

module.exports = BlockStatement;