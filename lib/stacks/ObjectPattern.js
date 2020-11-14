const Stack = require("../Stack");
const Utils = require("../Utils");
class ObjectPattern extends Stack {

    constructor(module,node,scope,parentNode)
    { 
        super(module,node,scope,parentNode);
        this.properties = node.properties.map( item=>{
            return Utils.createStack( module, item, scope, node);
        });
   }

   parser(){ 
   }

   raw(){
       return this.node.name;
   }

   emit(){
       return this.raw();
   }
}

module.exports = ObjectPattern;