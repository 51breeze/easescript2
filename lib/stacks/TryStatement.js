const Stack = require("../Stack");
const Utils = require("../Utils");
const Declarator = require("./Declarator");
class TryStatement extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.isTryStatement= true;
        this.param = new Declarator(compilation,node.handler.param,scope,node,this);
        this.handler = Utils.createStack( compilation,node.handler.body, scope, node,this );
        this.block = Utils.createStack( compilation,node.block, scope, node,this );
        scope.define(this.param.value(), this.param);
    }

   parser(syntax){
      this.param.parser(syntax);
      this.handler.parser(syntax);
      this.block.parser(syntax);
   }

   emit(syntax)
   {
      const name = this.param.emit(syntax);
      const handler=  this.handler.emit(syntax);
      const block  =  this.block.emit(syntax);
       return `try{${block}}catch(${name}){${handler}}`;
   }
}

module.exports = TryStatement;