const Stack = require("../Stack");
const Utils = require("../Utils");
class AnnotationDeclaration extends Stack{

   constructor(compilation,node,scope,parentNode,parentStack)
   {
        super(compilation,node,scope,parentNode,parentStack);
   }

   parser( syntax )
   {
   }

   value(){
      return this.raw();
   }

   emit( syntax )
   {
       return "";
   }
}

module.exports = AnnotationDeclaration;