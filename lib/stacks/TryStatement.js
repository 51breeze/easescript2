class TryStatement{

   constructor(node,scope,parentNode,name,handler,acceptType,body)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.name = name;
        this.acceptType = acceptType;
        this.handler = handler;
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

module.exports = TryStatement;