const Stack = require("../Stack");
const Utils = require("../Utils");
const BlockScope = require("../scope/BlockScope");
class BlockStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
         super(compilation,node,scope,parentNode,parentStack);
         if( parentNode && !(parentNode.type ==="FunctionDeclaration" || parentNode.type==="FunctionExpression" || parentNode.type==="ArrowFunctionExpression") )
         {
            scope = new BlockScope(scope);
         }
         this.body = node.body.map( item=>Utils.createStack( compilation, item, scope, node,this ) );
    }

   parser(syntax)
   {
      this.body.forEach( item=>item.parser(syntax) );
   }

   emit( syntax )
   {
       return this.body.map( item=>{
           return item.emit(syntax);
       }).join("\r\n");
   }
}

module.exports = BlockStatement;