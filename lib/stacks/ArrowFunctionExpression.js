const Stack = require("../Stack");
const Utils = require("../Utils");
const FunctionScope = require("../scope/FunctionScope");
class ArrowFunctionExpression extends Stack{

    constructor(module,node,scope,parent)
    {
         super(module,node,scope,parent);
         scope = new FunctionScope(scope);
         this.expression = !!node.expression;
         this.returnType= Utils.createStack(module,node.returnType,scope,node);
         this.body      = Utils.createStack(module,node.body,scope,node);
         this.params    = node.params.map( item=>{
             return Utils.createStack(module,item,scope,node);
         });
    }

   parser()
   {
      this.body.parser();
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

module.exports = ArrowFunctionExpression;