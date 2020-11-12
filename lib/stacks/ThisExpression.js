class ThisExpression{

   constructor(node,scope,parentNode)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
   }

   parser()
   {
      return;
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

module.exports = ThisExpression;