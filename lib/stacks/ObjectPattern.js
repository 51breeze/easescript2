const Stack = require("../Stack");
const Utils = require("../Utils");
class ObjectPattern extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.properties = node.properties.map( item=>{
            return Utils.createStack( compilation, item, scope, node,this);
        });
   }

   parser(syntax){ 
   }

   raw(){
       return this.node.name;
   }

   emit(syntax){
       return this.properties.map( item=> item.emit(syntax) ).join(",")
   }
}

module.exports = ObjectPattern;