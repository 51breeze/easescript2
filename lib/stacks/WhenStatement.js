class WhenStatement{

   constructor(node,scope,parentNode,test,consequent,alternate)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
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

module.exports = WhenStatement;