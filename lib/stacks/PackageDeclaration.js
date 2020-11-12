class PackageDeclaration{

   constructor(node,scope,parentNode,id,body)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.id = id;
        this.body = body;
   }

   parser()
   {
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

module.exports = PackageDeclaration;