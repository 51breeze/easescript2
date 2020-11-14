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
        return this.body.forEach(item =>{
            item.parser();
        });
   }

   raw()
   {
       return this.node.name;
   }

   emit()
   {
        this.parser();
        return this.body.map(item =>{
            return item.emit();
        });
   }
}

module.exports = PackageDeclaration;