const Syntax = require("./Syntax");
class MemberExpression extends Syntax{
   emit(syntax){
      const object = this.stack.object.emit(syntax);
      const property = this.stack.property.value();
      const description = this.stack.check();
      const option = this.getSyntaxOption();
      if( option.target === "es5" ){
         if( description && description.kind ==="get" ){
            const name = property.substr(0,1).toUpperCase()+property.substr(1);
            if( this.stack.object.isSuperExpression ){
               return `${object}.get${name}.call(this)`;
            }
            return `${object}.get${name}()`;
         }
      }
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
      return  `${object}.${property}`;
   }
}

module.exports = MemberExpression;
