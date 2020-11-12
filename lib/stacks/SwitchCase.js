class SwitchCase{

   constructor(node,scope,parentNode,condition,body)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.condition = condition;
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

module.exports = SwitchCase;