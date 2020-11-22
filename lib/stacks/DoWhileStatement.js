const Stack = require("../Stack");
const Utils = require("../Utils");
class DoWhileStatement extends Stack{

   constructor(compilation,node,scope,parentNode,parentStack)
   {
        super(module,node,scope,parentNode,parentStack);
        this.condition = Utils.createStack(compilation,node.test,scope,node,this);
        this.body = Utils.createStack(compilation,node.body,scope,node,this);
   }

   parser(syntax)
   {
      return this.body.parser(syntax);
   }

   emit( syntax )
   {
      const condition =  this.condition.emit(syntax);
      const body =  this.body.emit(syntax);
       return `do{${body}}while(${condition})`;
   }
}

module.exports = DoWhileStatement;