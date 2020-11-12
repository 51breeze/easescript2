class CallExpression{

   constructor(node,scope,parentNode,callee,arguments)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.callee = callee;
        this.arguments = arguments;
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

module.exports = CallExpression;