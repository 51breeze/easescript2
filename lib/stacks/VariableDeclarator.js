const Stack = require("../Stack");
const Utils = require("../Utils");
class VariableDeclarator extends Stack {

    constructor(module,node,scope,parentNode)
    { 
        super(module,node,scope,parentNode);
        this.id = Utils.createStack( module,node.id, scope, node);
        this.acceptType = Utils.createStack( module,node.acceptType, scope, node);
        this.init = Utils.createStack( module,node.init, scope, node);
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

module.exports = VariableDeclarator;