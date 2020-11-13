const Stack = require("../Stack");
const Utils = require("../Utils");
class PackageDeclaration extends Stack{

    constructor(module,node,scope,parentNode)
    {
        super(module,node,scope,parentNode);
        this.id = Utils.createStack( module, node.id, scope, node );
        this.body = node.body.map( item=>{
            return Utils.createStack( module, item, scope, node );
        });
   }

   parser()
   {
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

module.exports = PackageDeclaration;