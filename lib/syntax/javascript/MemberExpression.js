const Syntax = require("./Syntax");
class MemberExpression extends Syntax{
   emit(syntax){
      const object = this.stack.object.emit(syntax);
      const property = this.stack.property.emit(syntax);
      const description = this.stack.check();
      if( description && description.kind ==="get" ){
         if( this.stack.object.isSuperExpression ){
            return `${object}.${property}.call(this)`;
         }
         return `${object}.${property}()`;
      }
      return  `${object}.${property}`;
   }
}

module.exports = MemberExpression;
