class MethodDefinition{

   constructor(node,scope,parentNode,params,returnType,body)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.key = node.id.name;
        this.params = params;
        this.returnType = returnType;
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

module.exports = MethodDefinition;