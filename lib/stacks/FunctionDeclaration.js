const Stack = require("../Stack");
const Utils = require("../Utils");
const FunctionExpression = require("./FunctionExpression");
class FunctionDeclaration extends FunctionExpression{

    constructor(module,node,scope,parentNode,parentStack)
    {
        super(module,node,scope,parentNode,parentStack);
        this.id = Utils.createStack(module,node.id,scope,node,this);
        scope.define( this.id.value(), this );
   }

   parser(syntax)
   {
       super.parser(syntax);
   }

   raw()
   {
       return this.node.name;
   }

   emit(syntax)
   {
       return super.emit(syntax);
   }
}

module.exports = FunctionDeclaration;