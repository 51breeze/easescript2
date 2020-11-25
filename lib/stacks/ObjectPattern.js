const Stack = require("../Stack");
const Utils = require("../Utils");
class ObjectPattern extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.properties = node.properties.map( item=>{
            const stack = Utils.createStack( compilation, item, scope, node,this);
            scope.define( stack.key.value(), stack.key );
            return stack;
        });
   }

   parser(syntax){ 
   }

   raw(){
       return this.node.name;
   }

   emit(syntax){
       return this.properties.map( item=> item.emit(syntax) )
   }
}

module.exports = ObjectPattern;