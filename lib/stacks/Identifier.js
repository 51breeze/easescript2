class Identifier{

   constructor(node,scope,parentNode)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
   }

   parser(){

   }

   raw(){
       return this.node.name;
   }

   emit(){
       return this.node.name;
   }
}

module.exports = Identifier;