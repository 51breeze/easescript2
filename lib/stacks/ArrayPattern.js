const Stack = require("../Stack");
const Utils = require("../Utils");
class ArrayPattern extends Stack {

    constructor(module,node,scope,parentNode)
    { 
        super(module,node,scope,parentNode);
        this.elements = node.elements.map( item=>{
            return Utils.createStack( module,item, scope, node);
        });
   }

   parser(){ 
      this.elements.forEach( item=>item.parser() );
   }

   raw(){
       return this.node.name;
   }

   emit(){
       return this.raw();
   }
}

module.exports = ArrayPattern;