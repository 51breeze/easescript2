const Stack = require("../Stack");
const Utils = require("../Utils");
class IfStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.condition = Utils.createStack(compilation,node.test,scope,node);
        this.consequent  = Utils.createStack(compilation,node.consequent,scope,node);
        this.alternate  = Utils.createStack(compilation,node.alternate,scope,node);
   }

   parser()
   {
        this.consequent.parser();
        if( this.alternate ){
           this.alternate.parser();
        }
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

module.exports = IfStatement;