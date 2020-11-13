const Stack = require("../Stack");
const Utils = require("../Utils");
class VariableDeclaration extends Stack {

    constructor(module,node,scope,parentNode)
    { 
        super(module,node,scope,parentNode);
        this.declarations = node.declarations.map( item=>{
            return Utils.createStack( module,item, scope, node);
        });
        this.flag = false;
        switch( parentNode && parentNode.type )
        {
            case "ForStatement":
            case "ForInStatement":
            case "ForOfStatement":
                this.flag=true;
            break;    
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