const Stack = require("../Stack");
const Utils = require("../Utils");
class ImportDeclaration extends Stack{

   constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isImportDeclaration= true;
        this.specifiers = Utils.createStack( compilation, node.specifiers, scope, node,this );
   }
   definition(){
      const type = this.type();
      if( type ){
         return type.definition();
      }
   }
   description(){
      return this.specifiers.description();
   }

   type(){
      return this.specifiers.type();
   }

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
