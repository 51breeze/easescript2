const Stack = require("../Stack");
const Utils = require("../Utils");
const ClassScope = require("../scope/ClassScope");
class ClassDeclaration extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
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

        if( !compilation.module.checkClassName( compilation.module.id ) ){
            this.id.throwError(`"${this.id.value()}" class identifier is not consistent with the file name.`);
        }

        if( this.inherit ){
            const module = compilation.getType( this.inherit.value() );
            compilation.module.extends = module;
            if( module ){
                compilation.module.addDepend( module.getName(), module );
            }else{
                this.inherit.throwError(`"${ this.inherit.value()}" is not exists`)
            }
        }

        compilation.module.implements = this.implements.map( item=>{
            const module = compilation.getType( item.value() );
            if( module ){
                if( !module.isInterface ){
                    item.throwError(`"${item.value()}" is not interface type`) 
                }
                compilation.module.addDepend( module.getName(), module );
            }else {
                item.throwError(`"${item.value()}" is not exists`)
            }
            this.implementCheck( module, item );
            return module;
        });
        compilation.module.publish();
    }

    implementCheck(module, stack ){
        const members = module.members;
        const check = (left,right)=>{
            if( !left )return;
            if( !right ){
                stack.throwError(`the "${left.value()}" member at the interface of ${module.getName()} is not implemented in class of ${this.compilation.module.getName()}`);
            }else if( !Utils.checkTypeForBoth(left.type(),right.type()) ){
                stack.throwError(`the "${left.value()}" member return type not matched at the interface of ${module.getName()} in class of ${this.compilation.module.getName()}`);
            }else if( Utils.isStackByName(left,"MethodDefinition") ){
                if( !Utils.isStackByName(right,"MethodDefinition") ){
                    stack.throwError(`the "${left.value()}" member method inconformity at the interface of ${module.getName()} in class of ${this.compilation.module.getName()}`);
                }
                if( left.params.length !== right.params.length ){
                    stack.throwError(`the "${left.value()}" member method params not matched at the interface of ${module.getName()} in class of ${this.compilation.module.getName()}`);
                }
                const result = left.params.every( (item,index)=>{
                    return right.params[index] ? Utils.checkTypeForBoth(item.type(),right.params[index].type() ) : false;
                });
                if( !result ){
                    stack.throwError(`the "${left.value()}" member method params type not matched. at the interface of ${module.getName()} in class of ${this.compilation.module.getName()}`);
                }
            }
        }
        for(var name in members){
           const left = members[name];
           const right = this.compilation.module.members[ name ];
           if( left.isAccessor ){
               check(left.get, right.get);
               check(left.set, right.set);
           }else{
               check(left, right);
           }
        }

        module.extends.forEach( item=>{
            this.implementCheck(item, stack);
        });
    }

    parser(syntax){
        this.body.forEach(item =>{
            item.parser(syntax);
        });
    }

    emit( syntax ){
        this.parser(syntax);
        const body = this.body.map( item=>item.emit(syntax) ).filter( item=>!!item );
        return body.join("\r\n");
    }
}

module.exports = ClassDeclaration;