class AssignmentExpression{

   constructor(node,scope,parentNode,left,right)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.left = left;
        this.right = right;
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

module.exports = AssignmentExpression;