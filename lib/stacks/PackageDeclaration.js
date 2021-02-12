const Stack = require("../Stack");
const Utils = require("../Utils");
const Namespace = require("../Namespace");
class PackageDeclaration extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isPackageDeclaration= true;
        this.id = Utils.createStack( compilation, node.id, scope, node, this );
        compilation.module.namespace = Namespace.create( this.id ? this.id.value() : null );
        const metatypes = [];
        const annotations = [];
        this.declarations = [];
        this.body=[];
        node.body.forEach( item=>{
            const stack = Utils.createStack( compilation, item, scope, node, this );
            if( stack.isMetatypeDeclaration ){
                metatypes.push( stack );
            }else if(stack.isAnnotationDeclaration ){
                annotations.push( stack );
            }else{
                stack.metatypes = metatypes.splice(0,metatypes.length);
                stack.annotations = metatypes.splice(0,annotations.length);
                if(stack.isImportDeclaration){
                    this.declarations.push( stack );
                }else{
                    this.body.push(stack);
                }
            }
        });
        this.declarations.forEach( stack=>{
            const module = compilation.getType( stack.value() );
            if( module ){
                if( module.id ){ 
                    compilation.module.addImport( module.id, module );
                }else{
                    stack.throwError(`'${stack.value()}' is not exists.`)
                }
            }else{
                stack.throwError(`'${stack.value()}' is not exists.`)
            }
        });
        this.body.forEach( item=>{
            if( item.isClassDeclaration || item.isInterfaceDeclaration ){
                item.parserBody();
            }
        });
   }

   parser(syntax){
        this.body.forEach(item =>{
            item.parser(syntax);
        });
   }
}

module.exports = PackageDeclaration;