const Stack = require("../Stack");
const Utils = require("../Utils");
class AssignmentExpression extends Stack{

    constructor(module,node,scope,parent)
    {
         super(module,node,scope,parent);
         this.left = Utils.createStack( module, node.left, scope, node );
         this.right = Utils.createStack( module, node.right, scope, node );
    }

   parser()
   {
       this.left.parser();
       this.right.parser();
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

module.exports = AssignmentExpression;