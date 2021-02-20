const Syntax = require("./Syntax");
const Utils = require("../../Utils");
class MemberExpression extends Syntax{
   emit(syntax){
      const object = this.stack.object.emit(syntax);
      const property = this.stack.property.value();
      const description = this.stack.check();
      const option = this.getSyntaxOption();
      if(description && (description.isMethodDefinition || description.isPropertyDefinition)){
         let parent = this.stack.parentStack;
         while(parent && parent.isMemberExpression){
            parent = parent.parentStack;
         }
         parent.isSyntaxRemoved = !this.checkMetaTypeSyntax(description.metatypes);
         if( parent.isSyntaxRemoved ){
            if( !(parent.isExpressionStatement || parent.isCallExpression ) ){
                this.stack.throwError("the expression is removed.");
            }
         }
      }  
      if( option.target === "es5" && description && description.kind ==="get" ){
         const name = Utils.firstToUpper(property);
         if( this.stack.object.isSuperExpression ){
            return `${object}.get${name}.call(this)`;
         }
         return `${object}.get${name}()`;
      }
      if( description.isModule ){
         if(description.isClass || description.isInterface){
            description.used = true;
            if( this.module === description || this.module.imports.has( property )){
               return property;
            }
            return `global.getClass(${this.getIdByModule(description)})`;
         }
      }  
      if(description.isMethodDefinition){
         const modifier =description.modifier.value();
         const refModule = description.compilation.module;
         if(modifier==="private" && refModule.children.length > 0){
             return `${this.module.id}.prototype.${property}`;
         }
      }
      return `${object}.${property}`;
   }
}

module.exports = MemberExpression;
