const Stack = require("../Stack");
const Utils = require("../Utils");
const ClassScope = require("../scope/ClassScope");
class InterfaceDeclaration extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        scope = new ClassScope(scope);
        super(compilation,node,scope,parentNode,parentStack);
        this.isInterfaceDeclaration= true;
        this.id          = Utils.createStack(compilation,node.id,scope,node,this);
        this.inherit     = Utils.createStack(compilation,node.extends,scope,node,this);
        this.implements  =(node.implements || []).map(item=>Utils.createStack(compilation,item,scope,node,this));
        this.modifier = Utils.createStack(compilation,node.modifier,scope,node);
        compilation.module.id = this.id.value();
        compilation.module.isInterface = true;
        compilation.module.implements = this.implements.map( (stack)=>{
            const module = compilation.getType( stack.value() );
            if( module ){
                if( !(module.isInterface || module.isDeclarator) ){
                    stack.throwError(`"${stack.value()}" is not interface`) 
                }
                compilation.module.addDepend( module.getName(), module );
            }else {
                stack.throwError(`"${stack.value()}" is not exists`);
            }
            return module;
        });
        if( !compilation.module.checkClassName( compilation.module.id ) ){
            this.id.throwError(`"${this.id.value()}" class identifier is not consistent with the file name.`);
        }
    }
    definition(){
        return;
    }
    parserBody(){
        const compilation = this.compilation;
        if( this.inherit ){
            const module = compilation.getType( this.inherit.value() );
            compilation.module.extends = module;
            if( module ){
                module.used = true;
                compilation.module.addDepend( module.getName(), module );
            }else{
                this.inherit.throwError(`"${this.inherit.value()}" does is not exists.`);
            }
        }
        const metatypes = [];
        const annotations = [];
        this.body = (this.node.body.body || []).map( item=>{
            const stack = Utils.createStack( compilation, item, this.scope, this.node,this );
            if( Utils.isStackByName(stack,"MetatypeDeclaration") ){
                metatypes.push( stack );
            }else if( Utils.isStackByName(stack,"AnnotationDeclaration") ){
                annotations.push( stack );
            }else{
                stack.metatypes = metatypes.splice(0,metatypes.length);
                stack.annotations = metatypes.splice(0,annotations.length);
                return stack;
            }
        }).filter( item=>!!item );
        compilation.module.publish();
    }
    parser(grammar){
        this.parserBody(grammar);
    }
    raw(){
        return this.node.name;
    }
}

module.exports = InterfaceDeclaration;