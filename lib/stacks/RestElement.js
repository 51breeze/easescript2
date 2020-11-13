const Stack = require("../Stack");
const Utils = require("../Utils");
class RestElement extends Stack{

    constructor(module,node,scope,parentNode)
    {
        super(module,node,scope,parentNode);
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

module.exports = RestElement;