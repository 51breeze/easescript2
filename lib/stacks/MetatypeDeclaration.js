const Stack = require("../Stack");
const Utils = require("../Utils");
class MetatypeDeclaration extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
         super(compilation,node,scope,parentNode,parentStack);
         this.body = node.body.map( item=>{
            return Utils.createStack(compilation,item,scope,node,this);
         })
    }

    description(){

        const name = this.node.name;
        const target={};
        this.body.map( item=>{
             switch( name ){
                 case "Callable" :
                    const name = item.left.value();
                    if( item.node.right.type ==="ArrayExpression" )
                    {
                        target[ name ]=item.right.elements;
                        //console.log( item.right.elements )
                    }else{
                        target[ name ] = item.right;
                    }
                    return target;
             }
        });
        return target;
    }

   parser(syntax)
   {
      
   }

   emit(syntax)
   {
       return '';
   }
}

module.exports = MetatypeDeclaration;