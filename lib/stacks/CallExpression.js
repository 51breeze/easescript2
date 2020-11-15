const Stack = require("../Stack");
const Utils = require("../Utils");
class CallExpression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.callee = Utils.createStack( compilation, node.callee, scope, node, this );
        this.arguments = node.arguments.map( item=>Utils.createStack( compilation,item,scope,node,this) );
    }

   parser()
   {
      this.callee.parser();
      this.arguments.forEach( item=>item.parser() );
   }

   emit()
   {
       return this.raw();
   }
}

module.exports = CallExpression;