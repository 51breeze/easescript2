const Stack = require("../Stack");
const Utils = require("../Utils");
class ArrayExpression extends Stack{

    constructor(module,node,scope,parent)
    {
        super(module,node,scope,parent);
        this.elements = node.elements.map( (item)=>{
            return Utils.createStack(module,item,scope,node);
        });
    }

   parser()
   {
      return this.elements.parser();
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

module.exports = ArrayExpression;