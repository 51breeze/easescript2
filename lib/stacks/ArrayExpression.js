class ArrayExpression{

   constructor(node,scope,parentNode,elements)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.elements = elements;
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

module.exports = ArrayExpression;