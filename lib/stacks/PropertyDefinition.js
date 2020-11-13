const Stack = require("../Stack");
const Utils = require("../Utils");
class PropertyDefinition extends Stack{

    constructor(module,node,scope,parentNode)
    {
        super(module,node,scope,parentNode);
        this.modifier = Utils.createStack( module, node.modifier, scope, node );
        this.declarations = node.declarations.map( item=>{
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

module.exports = PropertyDefinition;