const Stack = require("../Stack");
const Utils = require("../Utils");
const FunctionExpression = require("./FunctionExpression");
class FunctionDeclaration extends FunctionExpression{

    constructor(module,node,scope,parentNode,parentStack)
    {
        super(module,node,scope,parentNode,parentStack);
        this.id = Utils.createStack(module,node.id,scope,node,this);
   }

   parser()
   {
        this.body.parser();
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

module.exports = FunctionDeclaration;