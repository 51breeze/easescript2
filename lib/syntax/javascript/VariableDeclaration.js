const Syntax = require("./Syntax");
class VariableDeclaration extends Syntax {
   emit(syntax){
       const fnScope = this.scope.getScopeByType("function");
       if( fnScope.async ){
          let declarations = [];
          this.stack.declarations.forEach( item=>{
                if( item.isPattern ){
                    declarations = declarations.concat( item.id.properties || item.id.elements );
                }else{
                    declarations.push( item );
                }
          });
          fnScope.dispatcher("insertBefore", this.semicolon(`var ${declarations.map(item=>item.value()).join(",")}`) );
          return this.semicolon( this.stack.declarations.filter( item=>!!(item.isPattern || item.init) ).map( item=>item.emit(syntax,true) ).join(",") );
       }
       const kind = this.stack.kind;
       const declarations = this.stack.declarations.map( item=>item.emit(syntax) );
       if( this.stack.flag ){
            return `${kind} ${declarations.join(",")}`;
       }
       return this.semicolon(`${kind} ${declarations.join(",")}`);
   }
}

module.exports = VariableDeclaration;