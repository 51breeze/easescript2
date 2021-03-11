const Stack = require("../Stack");
const Utils = require("../Utils");
class ImportDeclaration extends Stack{

   constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isImportDeclaration= true;
        this.specifiers = Utils.createStack( compilation, node.specifiers, scope, node,this );
   }
   definition(){
      const identifier = this.value();
      const context = this;
      const type = this.type();
      const kind = type.isClass || type.isDeclarator? 'Class' : "Interface";
      return {
            kind:"import",
            comments:context.comments,
            identifier:identifier,
            expre:`(${kind}) import ${type.getName()}`,
            type:type,
            start:this.specifiers.start,
            end:this.specifiers.end,
            file:context.compilation.module.file,
            context
      };
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
