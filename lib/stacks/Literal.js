const Stack = require("../Stack");
const Utils = require("../Utils");
const Type  = require("../Type");
class Literal extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        let type = "String";
        if( node.regex )
        {
            type= "RegExp";
        }else if(node.value == node.raw)
        {
            type= "Number";
        }else if( node.raw === "false" || node.raw === "true")
        {
            type = "Boolean";

        }else if( node.raw === "null"){
            type = "Nullable";
        }
        this.type = new Type(type);
   }

   get description()
   {
       return this.type;
   }

   parser(){

   }

   value()
   {
      return this.node.value;
   }

   raw()
   {
       return this.node.raw;
   }

   emit()
   {
       return this.raw();
   }
}

module.exports = Literal;