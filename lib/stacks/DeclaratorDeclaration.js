const Stack = require("../Stack");
const Utils = require("../Utils");
const ClassScope = require("../scope/ClassScope");
class DeclaratorDeclaration extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack){
        scope = new ClassScope(scope);
        super(compilation,node,scope,parentNode,parentStack);
        this.isDeclaratorDeclaration= true;
        this.id          = Utils.createStack(compilation,node.id,scope,node,this);
        this.inherit     = Utils.createStack(compilation,node.extends,scope,node,this);
        this.implements  =(node.implements || []).map(item=>Utils.createStack(compilation,item,scope,node,this));
        this.modifier = Utils.createStack(compilation,node.modifier,scope,node,this);
        compilation.module.id = this.id.value();
        compilation.module.isDeclarator = true;
        compilation.module.implements = this.implements.map( (stack)=>{
            const module = compilation.getType( stack.value() );
            if( module ){
                if( !(module.isInterface || module.isDeclarator) ){
                    stack.throwError(`"${stack.value()}" is not interface`) 
                }
                compilation.module.addDepend( module.getName(), module );
            }else {
                stack.throwError(`"${stack.value()}" is not exists`)
            }
            return module;
        });
        if( !compilation.module.checkClassName( compilation.module.id ) ){
            this.id.throwError(`"${this.id.value()}" class identifier is not consistent with the file name.`);
        }
        if( this.inherit ){
           compilation.module.extends = compilation.getType( this.inherit.value() );
        }
        const metatypes = [];
        const annotations = [];
        this.body = (node.body.body || []).map( item=>{
            const stack = Utils.createStack( compilation, item, scope, node,this );
            if( stack.isMetatypeDeclaration ){
                metatypes.push( stack );
            }else if( stack.isAnnotationDeclaration ){
                annotations.push( stack );
            }else{
                stack.metatypes = metatypes.splice(0,metatypes.length);
                stack.annotations = metatypes.splice(0,annotations.length);
                return stack;
            }
        }).filter( item=>!!item );
        compilation.module.publish();
   }

}

module.exports = DeclaratorDeclaration;