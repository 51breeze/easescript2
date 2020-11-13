const Stack = require("../Stack");
const Utils = require("../Utils");
class EnumDeclaration extends Stack{

    constructor(module,node,scope,parentNode)
    {
        super(module,node,scope,parentNode);
        this.inherit = Utils.createStack(module,node.extends,scope,node);
        const properties = [];
        let lastValue = 0;
        node.value.expressions.forEach( (item,index)=>{
            const key = item.left ? item.left.name : item.name;
            const value = item.right ? Utils.createStack(module,item.right,scope,item) : {node:item,value:lastValue++};
            properties.push( {value,key} );
            if( item.right && typeof item.right.value ==="number" )
            {
                lastValue = item.right.value+1;
            }
        });
        scope.define(node.name, this);
        this.properties = properties;
   }

   parser()
   {
      return this.body.parser();
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

module.exports = EnumDeclaration;