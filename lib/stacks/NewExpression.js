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