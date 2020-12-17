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
        this.body = (node.body.body || []).map( item=>{
            const stack = Utils.createStack( compilation, item, scope, node,this );
            if( Utils.isStackByName(stack,"ImportDeclaration") ){
                const module = compilation.getType( stack.value() );
                if( module ){
                    compilation.module.addDepend( module.getName(), module );
                }else{
                    this.throwError(`"${stack.value()}" is not exists.`)
                }
            }else if( Utils.isStackByName(stack,"MetatypeDeclaration") ){
                metatypes.push( stack );
            }else if( Utils.isStackByName(stack,"AnnotationDeclaration") ){
                annotations.push( stack );
            }else{
                stack.metatypes = metatypes.splice(0,metatypes.length);
                stack.annotations = metatypes.splice(0,annotations.length);
                return stack;
            }
        }).filter( item=>!!item );
        compilation.module.id = this.id.value();
        compilation.module.isInterface = true;
        if( this.inherit ){
            compilation.module.extends = compilation.getType( this.inherit.value() );
        }
        compilation.module.implements = this.implements.map( item=>{
            return compilation.getType( item.value() );
        });
        compilation.module.publish();
   }
   
   parser(syntax)
   {
       this.body.forEach( item=>item.parser(syntax) );
   }

   raw()
   {
       return this.node.name;
   }

   emit(syntax)
   {
      const body = this.body.map( item=>item.emit(syntax) ).join("\n");
      return body;
   }
}

module.exports = InterfaceDeclaration;