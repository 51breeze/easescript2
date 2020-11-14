const Stack = require("../Stack");
const Utils = require("../Utils");
const FunctionScope = require("../scope/FunctionScope");
class FunctionExpression extends Stack{

    constructor(module,node,scope,parentNode)
    {
        super(module,node,scope,parentNode);
        scope = new FunctionScope(scope);
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

module.exports = FunctionExpression;