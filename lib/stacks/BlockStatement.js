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
        this.isBlockStatement= true;
        this.body = node.body.map( (item)=> Utils.createStack( compilation, item, scope, node, this ));
        this.insertBefore = [];
        this.addListener("insertBefore",(content)=>{
            if( content ){
                this.insertBefore.push(content);
            }
        });
    }

    parser(syntax){
        this.body.forEach( item=>item.parser(syntax) );
    }

    dissection(){
    }
}

module.exports = BlockStatement;