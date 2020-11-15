const Stack = require("../Stack");
const Utils = require("../Utils");
class DeclaratorDeclaration extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.metatypes = metatypes;
        this.annotations = annotations;
        this.id          = Utils.createStack(compilation,node.id,scope,node,this);
        this.inherit     = Utils.createStack(compilation,node.extends,scope,node,this);
        this.implements  =(node.implements || []).map( (item)=>{
            return Utils.createStack(compilation,item,scope,node,this);
        });
        this.modifier = Utils.createStack(compilation,node.modifier,scope,node,this);
        const MetatypeDeclaration = Utils.getStackByName('MetatypeDeclaration');
        const AnnotationDeclaration = Utils.getStackByName('AnnotationDeclaration');
        const metatypes = [];
        const annotations = [];
        this.body = (node.body.body || []).map( item=>{
            const stack = Utils.createStack( compilation, item, scope, node,this );
            if( stack instanceof MetatypeDeclaration )
            {
                metatypes.push( stack );
            }else if( stack instanceof AnnotationDeclaration ){
                annotations.push( stack );
            }else{
                stack.metatypes = metatypes.splice(0,metatypes.length);
                stack.annotations = metatypes.splice(0,annotations.length);
                return stack;
            }
        }).filter( item=>!!item );
   }

   parser()
   {
       this.body.forEach( item=>item.parser() );
   }
   emit()
   {
       return this.body.map( item=>item.emit() );
   }
}

module.exports = DeclaratorDeclaration;