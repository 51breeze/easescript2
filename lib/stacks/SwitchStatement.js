const Stack = require("../Stack");
const Utils = require("../Utils");
class SwitchStatement  extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.condition = Utils.createStack( compilation, node.test, scope, node,this );
        this.cases = node.cases.map( item=>{
           return Utils.createStack( compilation, item, scope, node,this );
        });
   }

   parser()
   {
       this.cases.forEach( item=>item.parser() );
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

module.exports = SwitchStatement;