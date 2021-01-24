const Syntax = require("./Syntax");
class ForInStatement extends Syntax{
   emit( syntax ){
       const left = this.stack.left.emit(syntax);
       const right = this.stack.right.emit(syntax);
       const body = this.stack.body ? this.stack.body.emit(syntax) : null;
       if( !body ){
          return this.semicolon(`for(${left} in ${right})`);
       }
       return `for(${left} in ${right}){${body}}`;
   }
}

module.exports = ForInStatement;