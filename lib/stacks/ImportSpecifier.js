const Stack = require("../Stack");
const Utils = require("../Utils");
class ImportSpecifier extends Stack{

   constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isImportSpecifier= true;
        this.expression = Utils.createStack( compilation, node.expression, scope, node,this );
   }
   definition(){
      const context = this.description();
      if( context.isType && context.isModule && (context.isClass || context.isDeclarator || context.isInterface) ){
         const type = this.type().toString();
         const identifier = this.value();
         const kind = context.isClass ? 'class' : context.isDeclarator ? "declarator" : "interface";
         const owner = context.getName();
         return {
               kind:"import",
               comments:context.comments,
               identifier:identifier,
               expre:`(import) ${kind} ${owner}`,
               type:type,
               start:this.callee.node.start,
               end:this.callee.node.end,
               file:context.compilation.module.file,
               context
         };
      }
   }
   description(){
      return this.expression.description();
   }
   type(){
      return this.expression.description().type();
   }
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
