const Stack = require("../Stack");
const Utils = require("../Utils");
class SwitchCase  extends Stack {

   constructor(compilation,node,scope,parentNode,parentStack)
   { 
        super(compilation,node,scope,parentNode,parentStack);
        this.condition = Utils.createStack( compilation, node.test, scope, node,this );
        this.consequent = node.consequent.map( item=>Utils.createStack( compilation, item, scope, node,this ) );
   }

   parser()
   {
      this.consequent.forEach( item=>item.parser() );
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

module.exports = SwitchCase;