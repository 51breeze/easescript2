const Stack = require("../Stack");
const Utils = require("../Utils");
class BinaryExpression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
         super(compilation,node,scope,parentNode,parentStack);
         this.left = Utils.createStack( compilation, node.left, scope, node,this );
         this.right = Utils.createStack( compilation, node.right, scope, node,this );
    }

   parser()
   {
        this.left.parser();
        this.right.parser();
   }

   emit()
   {
       return this.raw();
   }
}

module.exports = BinaryExpression;