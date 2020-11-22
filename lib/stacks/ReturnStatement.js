const Stack = require("../Stack");
const Utils = require("../Utils");
class ReturnStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.argument = Utils.createStack( compilation, node.argument, scope, node,this );
    }

   parser(syntax)
   {
      return this.argument.parser(syntax);
   }

   raw()
   {
       return this.node.name;
   }

   emit(syntax)
   {
       const argument = this.argument.emit(syntax);
       return `return ${argument}`;
   }
}

module.exports = ReturnStatement;