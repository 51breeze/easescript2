const Utils = require("../Utils");
const Stack = require("../Stack");
class VariableDeclaration extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.isVariableDeclaration= true;
        this.declarations = node.declarations.map( item=>{
            return Utils.createStack( compilation,item, scope, node,this);
        });
        this.kind = node.kind;
        this.flag = false;
        switch( parentNode && parentNode.type )
        {
            case "ForStatement":
            case "ForInStatement":
            case "ForOfStatement":
                this.flag=true;
            break;    
        }
   }

   parser(syntax){ 
      this.declarations.forEach( item=>item.parser(syntax) );
   }

   emit(syntax){
       const fnScope = this.scope.getScopeByType("function");
       if( fnScope.async ){
          let declarations = [];
          this.declarations.forEach( item=>{
                if( item.isPattern ){
                    declarations = declarations.concat( item.id.properties || item.id.elements );
                }else{
                    declarations.push( item );
                }
          });
          fnScope.dispatcher("insertBefore", `var ${declarations.map(item=>item.value()).join(",")}`);
          return this.declarations.filter(item=>!!(item.isPattern || item.init) ).map( item=>item.emit(syntax,true) ).join(",");
       }
       return syntax.makeDeclarationVariable(this.scope,this.kind,this.declarations.map( item=>item.emit(syntax) ) );
   }
}

module.exports = VariableDeclaration;