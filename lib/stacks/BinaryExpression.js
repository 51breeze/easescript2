const Stack = require("../Stack");
const Utils = require("../Utils");
class BinaryExpression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
         super(compilation,node,scope,parentNode,parentStack);
         this.left = Utils.createStack( compilation, node.left, scope, node,this );
         this.right = Utils.createStack( compilation, node.right, scope, node,this );
    }

    type(){
         return this.compilation.getType("Boolean");
    }

   parser( syntax ){
        this.left.parser(syntax);
        this.right.parser(syntax);
   }

   emit( syntax ){
        const left = this.left.emit(syntax);
        const right = this.right.emit(syntax);
        const operator = this.node.operator;
       return  `${left} ${operator} ${right}`;
   }
}

module.exports = BinaryExpression;