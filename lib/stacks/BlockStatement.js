const Stack = require("../Stack");
const Utils = require("../Utils");
const BlockScope = require("../scope/BlockScope");
class BlockStatement extends Stack{

    constructor(module,node,scope,parent)
    {
         super(module,node,scope,parent);
         if( parent && !(parent.type ==="FunctionDeclaration" || parent.type==="FunctionExpression" || parent.type==="ArrowFunctionExpression") )
         {
            scope = new BlockScope(scope);
         }
         this.body = node.body.map( item=>Utils.createStack( module, item, scope, node ) );
    }

   parser()
   {
      this.body.forEach( item=>item.parser() );
   }

   raw()
   {
       return this.node.name;
   }

   emit()
   {
       return this.raw();
   }
}

module.exports = BlockStatement;