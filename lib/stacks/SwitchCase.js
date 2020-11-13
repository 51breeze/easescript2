const Stack = require("../Stack");
const Utils = require("../Utils");
class SwitchCase  extends Stack {

   constructor(module,node,scope,parentNode)
   { 
        super(module,node,scope,parentNode);
        this.condition = Utils.createStack( module, node.test, scope, node );
        this.body = Utils.createStack( module, node.body, scope, node );
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

module.exports = SwitchCase;