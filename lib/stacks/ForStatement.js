class ForStatement{

   constructor(node,scope,parentNode,init,condition,update,body)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.init = init;
        this.condition = condition;
        this.update = update;
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

module.exports = ForStatement;