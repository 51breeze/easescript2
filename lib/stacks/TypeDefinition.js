const Stack = require("../Stack");
const Utils = require("../Utils");
class TypeDefinition extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this._value = Utils.createStack(compilation,node.value, scope, node, this);
    }

   get description()
   {
       return this.compilation.getType( this.value.value() );
   }

   parser(syntax)
   {
      this._value.parser(syntax);
   }

   value()
   {
     return this._value.value(syntax);
   }

   raw()
   {
       return this.node.name;
   }

   emit(syntax)
   {
       return this._value.emit(syntax);
   }
}

module.exports = TypeDefinition;