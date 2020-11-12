class TypeDefinition{

   constructor(node,scope,parentNode, type)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.type = type;
   }

   parser()
   {
      
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

module.exports = TypeDefinition;