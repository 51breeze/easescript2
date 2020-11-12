class SwitchStatement{

   constructor(node,scope,parentNode,condition,cases)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.condition = condition;
        this.cases = cases;
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

module.exports = SwitchStatement;