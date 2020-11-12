class PropertyDefinition{

   constructor(node,scope,parentNode,metatypes,annotations,modifier)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.metatypes = metatypes;
        this.annotations = annotations;
        this.modifier = modifier;
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

module.exports = PropertyDefinition;