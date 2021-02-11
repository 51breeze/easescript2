const Syntax = require("./Syntax");
class VariableDeclaration extends Syntax {
   emit(syntax){
       if( this.scope.asyncParentScopeOf ){
          let declarations = [];
          this.stack.declarations.forEach( item=>{
                if( item.isPattern ){
                    declarations = declarations.concat( item.id.properties || item.id.elements );
                }else{
                    declarations.push( item );
                }
          });
          const indent = this.getIndent(this.scope.asyncParentScopeOf.level+1);
          const declaration = `${indent}var ${declarations.map(item=>item.value()).join(",")};`;
          const fnStack = this.stack.getParentStackByName("FunctionExpression");
          fnStack.dispatcher("insertBefore", declaration);
          return this.semicolon( this.stack.declarations.filter( item=>!!(item.isPattern || item.init) ).map( item=>item.emit(syntax,true) ).join(",") );
       }
       const kind = this.stack.kind;
       const declarations = this.stack.declarations.map( item=>{
           return item.emit(syntax)
        });
       if( this.stack.flag ){
            return `${kind} ${declarations.join(",")}`;
       }
       return this.semicolon(`${kind} ${declarations.join(",")}`);
   }
}

module.exports = VariableDeclaration;