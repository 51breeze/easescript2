const Stack = require("../Stack");
const Utils = require("../Utils");
class MetatypeDeclaration extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
         super(compilation,node,scope,parentNode,parentStack);
    }

   parser(syntax)
   {
      
   }

   emit(syntax)
   {
       return '';
   }
}

module.exports = MetatypeDeclaration;