const Stack = require("../Stack");
const Utils = require("../Utils");
class CallExpression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.callee = Utils.createStack( compilation, node.callee, scope, node, this );
        this.arguments = node.arguments.map( item=>Utils.createStack( compilation,item,scope,node,this) );
    }

   parser(syntax)
   {
      this.callee.parser(syntax);
      this.arguments.forEach( item=>item.parser(syntax) );
   }

   emit( syntax )
   {
       const callee= this.callee.emit(syntax);
       const args = this.arguments.map( item=>item.emit(syntax) );
       return `${callee}(${args})`;
   }
}

module.exports = CallExpression;