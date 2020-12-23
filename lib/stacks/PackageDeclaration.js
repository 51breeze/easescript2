const Stack = require("../Stack");
const Utils = require("../Utils");
const Namespace = require("../Namespace");
class PackageDeclaration extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.id = Utils.createStack( compilation, node.id, scope, node, this );
        compilation.module.namespace = Namespace.create( this.id ? this.id.value() : null );
        const metatypes = [];
        const annotations = [];
        this.body = node.body.map( item=>{
            const stack = Utils.createStack( compilation, item, scope, node,this );
            if( Utils.isStackByName(stack,"MetatypeDeclaration") ){
                metatypes.push( stack );
            }else if( Utils.isStackByName(stack,"AnnotationDeclaration") ){
                annotations.push( stack );
            }else{
                stack.metatypes = metatypes.splice(0,metatypes.length);
                stack.annotations = metatypes.splice(0,annotations.length);
                if( Utils.isStackByName(stack,"ImportDeclaration") ){
                    const module = compilation.getType( stack.value() );
                    if( module ){
                        compilation.module.addImport( module.id, module );
                    }else{
                        stack.throwError(`"${stack.value()}" is not exists.`)
                    }
                    return null;
                }
                return stack;
            }
        }).filter( item=>!!item );
   }

   parser(syntax){
        this.body.forEach(item =>{
            item.parser(syntax);
        });
   }

   emit(syntax){
        const body = this.body.map(item =>{
            return item.emit(syntax);
        }).filter( item=>!!item ).join("\r\n");
        console.log( body )
        return body;
   }
}

module.exports = PackageDeclaration;