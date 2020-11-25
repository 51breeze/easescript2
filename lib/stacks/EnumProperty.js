const Stack = require("../Stack");
const Utils = require("../Utils");
class EnumProperty extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.increment = parentStack.increment++;
    }

    description(){
        return this;
    }

   type(){
       return this.compilation.getType("Number");
   }

   value(){
       return this.increment;
   }

   raw(){
       return this.increment;
   }

   emit( syntax )
   {
       return this.increment;
   }
}

module.exports = EnumProperty;