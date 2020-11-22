const Stack = require("../Stack");
const Utils = require("../Utils");
class LogicalExpression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
         super(compilation,node,scope,parentNode,parentStack);
         this.left = Utils.createStack( compilation, node.left, scope, node,this );
         this.right = Utils.createStack( compilation, node.right, scope, node,this );
    }

   parser(syntax)
   {
      return this.body.parser(syntax);
   }

   raw()
   {
       return this.node.name;
   }

   emit(syntax)
   {
        const left= this.left.emit( syntax );
        const right=  this.right.emit( syntax );
        const operator =  this.node.operator;
        return `${left} ${operator} ${right}`;
   }
}

module.exports = LogicalExpression;