const Stack = require("../Stack");
const Utils = require("../Utils");
class ImportDeclaration extends Stack{

   constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isImportDeclaration= true;
        this.specifiers = Utils.createStack( compilation, node.specifiers, scope, node,this );
   }

   description(){
      return this;
   }

   type(){
      return null;
   }

   parser(syntax){}

   value(){
     return this.specifiers.value();
   }
   
   raw(){
     return this.specifiers.raw();
   }

   emit(syntax){
      return this.specifiers.value();
   }
}

module.exports = ImportDeclaration;
