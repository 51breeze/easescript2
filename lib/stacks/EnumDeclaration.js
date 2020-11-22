const Stack = require("../Stack");
const Utils = require("../Utils");
const EnumProperty = require("./EnumProperty");
class EnumDeclaration extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.inherit = Utils.createStack(compilation,node.extends,scope,node,this);
        this.increment =0;
        const properties = [];
        const target = {};
        node.value.expressions.forEach( (item,index)=>{
            const key = item.left ? item.left.name : item.name;
            const value = item.right ? Utils.createStack(compilation,item.right,scope,item,this) : new EnumProperty(compilation,item,scope,node,this);
            properties.push({value,key});
            target[ key ] = value;
            if( item.right ){
                const lastValue = value.value();
                if( typeof lastValue === "number" )
                {
                    this.increment = value.value() + 1;
                }
            }
        });
        scope.define(node.name, this);
        this.target = target;
        this.properties = properties;
   }

   description(){
       return this.target;
   }

   type()
   {
       return this.compilation.getType("Object");
   }

   parser(syntax)
   {
       this.properties.forEach( item=>{
           if( item.parser ){
              item.parser(syntax);
           }
       });
   }

   emit( syntax )
   {
       const properties = this.properties.map( item=>{
           const key = item.key;
           const value = item.value.value();
           return syntax.makeObjectKeyValue(key,value);
       });
       return syntax.makeObjectExpression(this.scope,properties);
   }
}

module.exports = EnumDeclaration;