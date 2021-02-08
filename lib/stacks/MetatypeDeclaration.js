const Stack = require("../Stack");
const Utils = require("../Utils");
const BlankScope = require("../scope/BlankScope");
class MetatypeDeclaration extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
         scope = new BlankScope( null );
         super(compilation,node,scope,parentNode,parentStack);
         this.isMetatypeDeclaration= true;
         this.body = node.body.map( item=>{
            return Utils.createStack(compilation,item,scope,node,this);
         });
    }

    get name(){
        return this.node.name;
    }

    description(){
        const target={};
        switch( this.name ){
            case "Callable" :
                this.body.map( item=>{
                    const key = item.left.value();
                    if( item.node.right.type ==="ArrayExpression" )
                    {
                        target[ key ]=item.right.elements;
                    }else{
                        target[ key ] = this.compilation.getType( item.right.value() );
                    }
                });
                break;
            case "Runtime" :
            case "Syntax" :
                this.body.map( item=>{
                    if( item.isIdentifier ){
                        if( !target.params )target.params = [];
                        target.params.push( item.value() )
                    }else if( item.isArrayExpression ){
                        target.params = item.right.elements.map( item=>item.value() );
                    }else if(item.AssignmentExpression){
                        const key = item.left.value();
                        target[key]=item.right.value();
                        if( key ==="expect"){
                            target[key] = Boolean(target[key]);
                        }
                    }
                });
                break;
            case "Router" :
                this.body.map( item=>{
                    if(item.AssignmentExpression){
                        const key = item.left.value();
                        target[key]=item.right.value();
                    }
                });
                break;
        }
        return target;
    }

   parser(syntax){
   }

   emit(syntax){
       return '';
   }
}

module.exports = MetatypeDeclaration;