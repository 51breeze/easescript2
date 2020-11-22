const Stack = require("../Stack");
const Utils = require("../Utils");
class ModifierDeclaration extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
    }
    
   parser(syntax)
   {
      return;
   }

   raw()
   {
       return this.node.name;
   }

   emit(syntax)
   {
       return this.node.name;
   }
}

module.exports = ModifierDeclaration;