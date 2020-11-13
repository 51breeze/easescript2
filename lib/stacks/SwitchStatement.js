const Stack = require("../Stack");
const Utils = require("../Utils");
class SwitchStatement  extends Stack {

    constructor(module,node,scope,parentNode)
    { 
        super(module,node,scope,parentNode);
        this.condition = Utils.createStack( module, node.test, scope, node );
        this.cases = node.cases.map( item=>{
           return Utils.createStack( module, item, scope, node );
        });
   }

   parser()
   {
      return this.body.parser();
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