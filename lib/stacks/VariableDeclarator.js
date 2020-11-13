const Stack = require("../Stack");
const Utils = require("../Utils");
class VariableDeclarator extends Stack {

    constructor(module,node,scope,parentNode)
    { 
        super(module,node,scope,parentNode);
        this.id = Utils.createStack( module,node.id, scope, node);
        this.acceptType = Utils.createStack( module,node.acceptType, scope, node);
        this.init = Utils.createStack( module,node.init, scope, node);
        this.elements = null;
        this.properties = null;
        if( node.id.type ==="ArrayPattern" ){
           this.elements = node.id.elements.map( item=>{
                return Utils.createStack( module,item, scope, node);
            });
        }else if( node.id.type ==="ObjectPattern" ){
            this.properties = node.id.properties.map( item=>{
                return Utils.createStack( module, item, scope, node);
            });
        }
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

module.exports = VariableDeclaration;