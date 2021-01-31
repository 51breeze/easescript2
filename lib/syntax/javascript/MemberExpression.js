const Syntax = require("./Syntax");
class MemberExpression extends Syntax{
   emit(syntax){
      const object = this.stack.object.emit(syntax);
      const property = this.stack.property.emit(syntax);
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
      return  `${object}.${property}`;
   }
}

module.exports = MemberExpression;
