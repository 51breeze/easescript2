const Stack = require("../Stack");
const Utils = require("../Utils");
class TryStatement extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.acceptType = Utils.createStack( compilation,node.handler.param.acceptType, scope, node,this );
        this.handler = Utils.createStack( compilation,node.handler.body, scope, node,this );
        this.block = Utils.createStack( compilation,node.block, scope, node,this );
   }

   parser(syntax)
   {
      this.handler.parser(syntax);
      this.block.parser(syntax);
   }

   raw()
   {
       return this.node.name;
   }

   emit(syntax)
   {
      const acceptType = this.acceptType.emit(syntax);
      const handler=  this.handler.emit(syntax);
      const block  =  this.block.emit(syntax);
       return `try{${block}}catch(){${handler}}`;
   }
}

module.exports = TryStatement;