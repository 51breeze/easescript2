const Stack = require("../Stack");
const Utils = require("../Utils");
class NewExpression extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.callee = Utils.createStack( compilation, node.callee, scope, node,this );
        this.arguments = node.arguments.map( item=>{
            return Utils.createStack( compilation, item, scope, node,this );
        });
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
       const callee= this.callee.emit(syntax);
       const args= this.arguments.map( item=>item.emit(syntax) ).join(",");
       return `new ${callee}(${args})`;
   }
}

module.exports = NewExpression;