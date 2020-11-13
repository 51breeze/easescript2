const Stack = require("../Stack");
const Utils = require("../Utils");
class Program extends Stack{

    constructor(module,node,scope,parentNode)
    {
        super(module,node,scope,parentNode);
        this.body = node.body.map( item=>{
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

module.exports = Program;