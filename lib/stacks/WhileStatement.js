const Stack = require("../Stack");
const Utils = require("../Utils");
class WhileStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
         super(compilation,node,scope,parentNode,parentStack);
         this.condition = Utils.createStack(compilation,node.test,scope,node,this);
         this.body = Utils.createStack(compilation,node.body,scope,node,this);
    }

   parser(syntax)
   {
      return this.body.parser(syntax);
   }

   raw()
   {
       return this.node.name;
   }

   emit(syntax)
   {
        const condition = this.condition.emit(syntax);
        const body = this.body.emit(syntax);
        return `while(${condition}){${body}}`;
   }
}

module.exports = WhileStatement;