const Stack = require("../Stack");
const Utils = require("../Utils");
class CallExpression extends Stack{

    constructor(module,node,scope,parent)
    {
        super(module,node,scope,parent);
        this.callee = Utils.createStack( module, node.callee, scope, node );
        this.arguments = Utils.createStack( module, node.arguments, scope, node );
    }

   parser()
   {
      return this.callee.parser();
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