const Utils = require("../Utils");
const Declarator = require("./Declarator");
class VariableDeclaration extends Declarator {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
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
       let before = '';
       this.once("insertBefore",(content)=>{
           before = content;
       });
       const str = syntax.makeDeclarationVariable(this.scope,this.kind,this.declarations.map( item=>item.emit(syntax) ) );
       if( before ){
           return `${before}\r\n${str}`;
       }
       return str;
   }
}

module.exports = VariableDeclaration;