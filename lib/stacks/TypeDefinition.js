const Stack = require("../Stack");
const Utils = require("../Utils");
class TypeDefinition extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.value = Utils.createStack(compilation,node.value, scope, node, this);
    }

   get description()
   {
       return this.compilation.getType( this.value.value() );
   }

   parser()
   {
      
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

module.exports = TypeDefinition;