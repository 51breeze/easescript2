const Stack = require("../Stack");
const Utils = require("../Utils");
class CallExpression extends Stack{

    constructor(module,node,scope,parent)
    {
        super(module,node,scope,parent);
        this.callee = Utils.createStack( module, node.callee, scope, node );
        this.arguments = node.arguments.map( item=>Utils.createStack( module,item,scope,node) );
    }

   parser()
   {
      this.callee.parser();
      this.arguments.forEach( item=>item.parser() );
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

module.exports = CallExpression;