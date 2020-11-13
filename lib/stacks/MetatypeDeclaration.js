const Stack = require("../Stack");
const Utils = require("../Utils");
class MetatypeDeclaration extends Stack{

    constructor(module,node,scope,parent)
    {
         super(module,node,scope,parent);
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

module.exports = MetatypeDeclaration;