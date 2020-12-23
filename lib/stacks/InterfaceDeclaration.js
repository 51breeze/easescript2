const Stack = require("../Stack");
const Utils = require("../Utils");
const ClassScope = require("../scope/ClassScope");
class InterfaceDeclaration extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        scope = new ClassScope(scope);
        super(compilation,node,scope,parentNode,parentStack);
        this.id          = Utils.createStack(compilation,node.id,scope,node,this);
        this.inherit     = Utils.createStack(compilation,node.extends,scope,node,this);
        this.implements  =(node.implements || []).map( (item)=>{
            return Utils.createStack(compilation,item,scope,node,this);
        });
        this.modifier = Utils.createStack(compilation,node.modifier,scope,node);
        const metatypes = [];
        const annotations = [];
        compilation.module.id = this.id.value();
        compilation.module.isInterface = true;
        this.body = (node.body.body || []).map( item=>{
            const stack = Utils.createStack( compilation, item, scope, node,this );
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
       
        if( !compilation.module.checkClassName( compilation.module.id ) ){
            this.id.throwError(`"${this.id.value()}" class identifier is not consistent with the file name.`);
        }
        if( this.inherit ){
            const module = compilation.getType( this.inherit.value() );
            compilation.module.extends = module;
            if( module ){
                compilation.module.addDepend( module.getName(), module );
            }else{
                this.inherit.throwError(`"${this.inherit.value()}" does is not exists.`);
            }
        }
        compilation.module.implements = this.implements.map( item=>{
            const module = compilation.getType( item.value() );
            if( module ){
               compilation.module.addDepend( module.getName(), module );
            }else{
                this.item.throwError(`"${this.item.value()}" does is not exists.`);
            }
            return module;
        });
        compilation.module.publish();
   }
   
   parser(syntax){
       this.body.forEach( item=>item.parser(syntax) );
   }

   raw(){
       return this.node.name;
   }

   emit(syntax){
      const body = this.body.map( item=>item.emit(syntax) ).join("\n");
      return body;
   }
}

module.exports = InterfaceDeclaration;