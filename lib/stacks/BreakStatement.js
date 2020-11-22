const Stack = require("../Stack");
const Utils = require("../Utils");
class BreakStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
    }

   parser(syntax){
   }
   
   emit( syntax )
   {
       return `break`;
   }
}

module.exports = BreakStatement;