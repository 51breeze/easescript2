const Stack = require("../Stack");
const Utils = require("../Utils");
class NewExpression extends Stack{

    constructor(module,node,scope,parentNode)
    {
        super(module,node,scope,parentNode);
        this.callee = Utils.createStack( module, node.callee, scope, node );
        this.arguments = node.arguments.map( item=>{
            return Utils.createStack( module, item, scope, node );
        });
   }

   parser()
   {
      return this.body.parser();
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

module.exports = NewExpression;