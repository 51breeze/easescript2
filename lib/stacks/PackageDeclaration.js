const Stack = require("../Stack");
const Utils = require("../Utils");
const Namespace = require("../Namespace");
class PackageDeclaration extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.id = Utils.createStack( compilation, node.id, scope, node, this );
        compilation.module.namespace = Namespace.create( this.id ? this.id.value() : null );
        const MetatypeDeclaration = Utils.getStackByName('MetatypeDeclaration');
        const AnnotationDeclaration = Utils.getStackByName('AnnotationDeclaration');
        const metatypes = [];
        const annotations = [];
        this.body = node.body.map( item=>{
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

   parser(syntax)
   {
        this.body.forEach(item =>{
            item.parser(syntax);
        });
   }

   emit(syntax)
   {
        this.parser(syntax);
        return this.body.map(item =>{
            return item.emit(syntax);
        }).join("\n");
   }
}

module.exports = PackageDeclaration;