const Stack = require("../Stack");
const Utils = require("../Utils");
class BinaryExpression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
         super(compilation,node,scope,parentNode,parentStack);
         this.left = Utils.createStack( compilation, node.left, scope, node,this );
         this.right = Utils.createStack( compilation, node.right, scope, node,this );
    }

   parser( syntax )
   {
        this.left.parser(syntax);
        this.right.parser(syntax);
   }

   emit( syntax )
   {
        const left = this.left.emit(syntax);
        const right = this.right.emit(syntax);
       return  `${left}=${right}`;
   }
}

module.exports = BinaryExpression;