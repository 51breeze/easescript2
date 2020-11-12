class VariableDeclaration{

   constructor(node,scope,parentNode,declarations)
   {
        this.node  = node;
        this.scope = scope;
        this.parentNode = parentNode;
        this.kind = node.kind;
        this.declarations = declarations;
        switch( parentNode && parentNode.type )
        {
            case "ForStatement":
            case "ForInStatement":
            case "ForOfStatement":
                this.flag=true;
            break;    
        }
   }

   parser(){

       
           
   }

   raw(){
       return this.node.name;
   }

   emit(){
       return this.raw();
   }
}

module.exports = VariableDeclaration;