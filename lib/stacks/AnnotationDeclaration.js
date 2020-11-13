const Stack = require("../Stack");
const Utils = require("../Utils");
class AnnotationDeclaration extends Stack{

   constructor(module,node,scope,parent)
   {
        super(module,node,scope,parent);
   }

   parser()
   {
      
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

module.exports = AnnotationDeclaration;