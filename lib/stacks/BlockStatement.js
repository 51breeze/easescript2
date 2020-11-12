class BlockStatement{

   constructor(node,scope,parentNode,body)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.body = body;
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

module.exports = BlockStatement;