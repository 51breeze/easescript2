class ExpressionStatement{

   constructor(node,scope,parentNode,expression)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.expression = expression;
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

module.exports = ExpressionStatement;