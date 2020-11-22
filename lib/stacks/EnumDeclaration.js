const Stack = require("../Stack");
const Utils = require("../Utils");
class EnumDeclaration extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.inherit = Utils.createStack(compilation,node.extends,scope,node,this);
        const properties = [];
        let lastValue = 0;
        node.value.expressions.forEach( (item,index)=>{
            const key = item.left ? item.left.name : item.name;
            const value = item.right ? Utils.createStack(compilation,item.right,scope,item,this) : {node:item,value:lastValue++};
            properties.push( {value,key} );
            if( item.right && typeof item.right.value ==="number" )
            {
                lastValue = item.right.value+1;
            }
        });
        scope.define(node.name, this);
        this.properties = properties;
   }

   parser(syntax)
   {
      //return this.body.parser();
   }

   emit( syntax )
   {
       return "";
   }
}

module.exports = EnumDeclaration;