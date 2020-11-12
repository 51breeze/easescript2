class Literal{

   constructor(node,scope,parentNode)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;

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
        this.type = type;
   }

   parser(){

   }

   raw(){
       return this.node.raw;
   }

   emit(){
       return this.node.value;
   }
}

module.exports = Literal;