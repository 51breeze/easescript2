class CallExpression{

   constructor(node,scope,parentNode,callee,args)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.callee = callee;
        this.arguments = args;
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