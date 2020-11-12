class ReturnStatement{

   constructor(node,scope,parentNode,argument)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.argument = argument;
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

module.exports = ReturnStatement;