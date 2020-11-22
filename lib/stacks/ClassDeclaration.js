const Stack = require("../Stack");
const Utils = require("../Utils");
const ClassScope = require("../scope/ClassScope");
class ClassDeclaration extends Stack{

   constructor(compilation,node,scope,parentNode,parentStack)
   {
        scope = new ClassScope(scope);
        super(compilation,node,scope,parentNode,parentStack);
        this.metatypes = [];
        this.annotations = [];
        this.id          = Utils.createStack(compilation,node.id,scope,node,this);
        this.inherit     = Utils.createStack(compilation,node.superClass,scope,node,this);
        this.static      = Utils.createStack(compilation,node.static,scope,node,this);
        this.implements  =(node.implements || []).map( (item)=>{
            return Utils.createStack(compilation,item,scope,node,this);
        });
        this.modifier = Utils.createStack(compilation,node.modifier,scope,node,this);
        const MetatypeDeclaration = Utils.getStackByName('MetatypeDeclaration');
        const AnnotationDeclaration = Utils.getStackByName('AnnotationDeclaration');
        const metatypes = [];
        const annotations = [];
        this.body = (node.body.body || []).map( item=>{
            const stack = Utils.createStack( compilation, item, scope, node ,this);
            if( stack instanceof MetatypeDeclaration )
            {
                metatypes.push( stack );
            }else if( stack instanceof AnnotationDeclaration ){
                annotations.push( stack );
            }else{
                stack.metatypes   = metatypes.splice(0,metatypes.length);
                stack.annotations = metatypes.splice(0,annotations.length);
                return stack;
            }
        }).filter( item=>!!item );
        compilation.module.id = this.id.value();
        compilation.module.isClass = true;
   }

   parser(syntax)
   {
        this.body.forEach(item =>{
            item.parser(syntax);
        });
   }

   emit( syntax )
   {
       this.parser(syntax);
       const body = this.body.map( item=>item.emit(syntax) ).filter( item=>!!item );
       console.log(  body )

       return body;
   }
}

module.exports = ClassDeclaration;