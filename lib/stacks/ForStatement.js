const Stack = require("../Stack");
const Utils = require("../Utils");
class ForStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.init  = Utils.createStack(compilation,node.init,scope,node,this);
        this.condition = Utils.createStack(compilation,node.test,scope,node,this);
        this.update  = Utils.createStack(compilation,node.update,scope,node,this);
        this.body  = Utils.createStack(compilation,node.body,scope,node,this);
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
        const init = this.init.emit(syntax);
        const condition = this.condition.emit(syntax);
        const update = this.update.emit(syntax);
        const body = this.body.emit(syntax);
        return  `for( ${init} ;${condition};${update} ){${body}}`;
   }
}

module.exports = ForStatement;