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

        this.declarations = this.node.declarations.map( (node)=>{
                
            if( node.id && node.id.type ==="ArrayPattern")
            {
                const initValue = this.parser(node.init,scope,node.id);
                const initType  = node.init.type;
                return node.id.elements.map( (item,index)=>{
                    const init = item.type === "AssignmentPattern" ? this.parser(item.right, scope, item) : null;
                    const id   = item.type === "AssignmentPattern" ? item.left.name : item.name;
                    const acceptType =  item.type === "AssignmentPattern" ? this.parser(item.left.acceptType,scope,item) : this.parser(item.acceptType,scope,item); 
                    const declar = new Declarator(item, id, parent.kind, initValue, acceptType, init);
                    if( initType ==="ObjectExpression" )
                    {  
                        declar.initValue = null;

                    }else if( initType ==="ArrayExpression" )
                    {
                        declar.initValue = initValue.elements[ index ];
                    }else{
                        declar.propName = index;
                    }
                    declar.isArrayPattern = true;
                    declar.parent = parent;
                    scope.define(id, declar);
                    return declar;
                });
            
            }else if( node.id && node.id.type ==="ObjectPattern" )
            {
                const initValue = this.parser(node.init, scope, node);
                const initType  = node.init.type;
                return node.id.properties.map( (item,index)=>{
                    const acceptType = this.parser(item.acceptType,scope, node.id);
                    const id = item.key.name;
                    const init = this.parser(item.value.right,scope, node.id);
                    const declar = new Declarator(item, id, parent.kind, initValue, acceptType, init);
                    if( initType ==="ObjectExpression" )
                    {
                        if( !check(initValue,id) )
                        {
                            this.error(`"${id}" is not defined.`, item, id);
                        }
                        declar.initValue = initValue.target[ id ];
                        declar.assignment = expression( initValue.target[ id ] );

                    }else if( initType ==="ArrayExpression" )
                    {
                        declar.initValue = null;
                    }else{
                        declar.propName = id;
                    }
                    declar.isObjectPattern = true;
                    declar.parent = parent;
                    scope.define(id, declar);
                    return declar;
                });
            }

            const id = node.id.name;  
            const acceptType = this.parser(node.id.acceptType,scope,node);
            const init       = this.parser(node.init,scope,node);
            const declar     = new Declarator(node, id, parent.kind, init, acceptType);
            if( init )
            {
                declar.assignment = expression( init );
            }
            declar.parent = parent;
            scope.define(id, declar);
            return declar;

        });
   }

   raw(){
       return this.node.name;
   }

   emit(){
       return this.raw();
   }
}

module.exports = VariableDeclaration;