const Stack = require("../Stack");
const Utils = require("../Utils");
class ArrayPattern extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.elements = node.elements.map( item=>{
            return Utils.createStack( compilation,item, scope, node,this);
        });
   }

   parser(){ 
      this.elements.forEach( item=>item.parser() );
   }

   emit(){
       return this.raw();
   }
}

module.exports = ArrayPattern;