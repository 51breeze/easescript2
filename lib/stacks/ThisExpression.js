const Stack = require("../Stack");
const Utils = require("../Utils");
class ThisExpression  extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
    }

   parser()
   {
      return;
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

module.exports = ThisExpression;