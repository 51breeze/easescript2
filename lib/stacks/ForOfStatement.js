class ForOfStatement{

   constructor(node,scope,parentNode,left,right,body)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.left = left;
        this.right = right;
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

module.exports = ForOfStatement;