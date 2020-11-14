const Stack = require("../Stack");
const Utils = require("../Utils");
class MethodDefinition extends Stack{

    constructor(module,node,scope,parentNode)
    {
        super(module,node,scope,parentNode);
        this.static  = Utils.createStack(module,node.static,scope,node);
        this.key     = Utils.createStack(module,node.key,scope,node);
        this.value   = Utils.createStack(module,node.value,scope,node);
        this.modifier= Utils.createStack(module,node.modifier,scope,node);
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

module.exports = MethodDefinition;