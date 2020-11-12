class NewExpression{

   constructor(node,scope,parentNode,callee)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.callee = callee;
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

module.exports = NewExpression;