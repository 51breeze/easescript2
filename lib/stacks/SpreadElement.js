const Stack = require("../Stack");
const Utils = require("../Utils");
class SpreadElement  extends Stack{

    constructor(module,node,scope,parentNode)
    {
        super(module,node,scope,parentNode);
        this.argument = Utils.createStack( module, node.argument, scope, node );
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

module.exports = SpreadElement;