const Stack = require("../Stack");
const Utils = require("../Utils");
class ImportSpecifier extends Stack{

   constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.expression = Utils.createStack( compilation, node.expression, scope, node,this );
   }
   description(){
      return this;
   }
   type(){
       return null;
   }
   parser(syntax){}
   raw(){
      return this.expression.raw();
   }
   value(){
      return this.expression.value();
   }
   emit(syntax){
      return this.expression.value();
   }
}

module.exports = ImportSpecifier;
