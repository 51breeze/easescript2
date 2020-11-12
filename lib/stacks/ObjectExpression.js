class ObjectExpression{

   constructor(node,scope,parentNode,properties)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
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

module.exports = ObjectExpression;