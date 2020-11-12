class IfStatement{

   constructor(node,scope,parentNode,condition,consequent,alternate)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.condition = condition;
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

module.exports = IfStatement;