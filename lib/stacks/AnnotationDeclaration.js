class AnnotationDeclaration{

   constructor(node,scope,parentNode)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
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

module.exports = AnnotationDeclaration;