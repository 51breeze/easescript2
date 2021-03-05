const Stack = require("../Stack");
const Utils = require("../Utils");
const ClassScope = require("../scope/ClassScope");
class ClassDeclaration extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack){
        scope = new ClassScope(scope);
        super(compilation,node,scope,parentNode,parentStack);
        this.isClassDeclaration= true;
        this.abstract = Utils.createStack(compilation,node.abstract,scope,node,this);
        this.metatypes = [];
        this.annotations = [];
        this.id          = Utils.createStack(compilation,node.id,scope,node,this);
        this.inherit     = Utils.createStack(compilation,node.superClass,scope,node,this);
        this.static      = Utils.createStack(compilation,node.static,scope,node,this);
        this.implements  = (node.implements || []).map((item)=>Utils.createStack(compilation,item,scope,node,this));
        this.modifier = Utils.createStack(compilation,node.modifier,scope,node,this);
        this.genericity = Utils.createStack(compilation,node.id.genericity,scope,node,this);
        compilation.module.id = this.id.value();
        compilation.module.abstract = !!this.abstract;
        compilation.module.isClass = true;
        compilation.module.genericity = this.genericity;
        if( !compilation.module.checkClassName( compilation.module.id ) ){
            this.id.throwError(`"${this.id.value()}" class identifier is not consistent with the file name.`);
        }
    }

    parserBody(){
        const metatypes = [];
        const annotations = [];
        const compilation = this.compilation;
        const scope = this.scope;
        const node  = this.node;
        if( this.inherit ){
            const module = compilation.getType( this.inherit.value() );
            compilation.module.extends = module;
            if( module ){
                module.used = true;
                module.children.push( compilation.module );
                compilation.module.addDepend( module.getName(), module );
            }else{
                this.inherit.throwError(`"${ this.inherit.value()}" is not exists`)
            }
        }
        compilation.module.implements = this.implements.map( (stack)=>{
            const module = compilation.getType( stack.value() );
            if( module ){
                if( !(module.isInterface || module.isDeclarator) ){
                    stack.throwError(`"${stack.value()}" is not interface`);
                }
                module.used = true;
                compilation.module.addDepend( module.getName(), module );
            }else {
                stack.throwError(`"${stack.value()}" is not exists`);
            }
            return module;
        });
        compilation.module.publish();
        this.body = (node.body.body || []).map( item=>{
            const stack = Utils.createStack( compilation, item, scope, node ,this);
            if( stack.isMetatypeDeclaration ){
                metatypes.push( stack );
            }else if( stack.isAnnotationDeclaration ){
                annotations.push( stack );
            }else{
                stack.metatypes   = metatypes.splice(0,metatypes.length);
                stack.annotations = metatypes.splice(0,annotations.length);
                return stack;
            }
        }).filter( item=>!!item );
    }

    implementCheck(interfaceModule,grammar){
        const check = (left,right)=>{
            if( !left )return;
            if(left.modifier && left.modifier.value() ==="private")return;
            const type = left.isAccessor ? "accessor" : left.isProperty ? "property" : "method";
            if( !right ){
                left.throwError(`the '${left.value()}' ${type} in the ${interfaceModule.getName()} is not implemented in the ${this.compilation.module.getName()}`);
            }else if( !Utils.checkTypeForBoth(left.type(),right.type()) ){
                right.throwError(`the '${right.value()}' ${type} return type does not matched with the ${type} return type in the ${interfaceModule.getName()}`);
            }else if( left.isMethodDefinition ){
                if( !right.isMethodDefinition ){
                    right.throwError(`the '${left.value()}' ${type} inconformity with the ${type} in the ${interfaceModule.getName()}`);
                }
                if( left.params.length > right.params.length ){
                    right.throwError(`the '${left.value()}' ${type} params missing with the ${type} params in the ${interfaceModule.getName()}`);
                }
                const result = left.params.every( (item,index)=>{
                    return right.params[index] ? Utils.checkTypeForBoth(item.type(),right.params[index].type() ) : false;
                });
                if( !result ){
                    right.throwError(`the '${left.value()}' ${type} params type not matched with the ${type} params in the ${interfaceModule.getName()}`);
                }
                const lGens = left.genericity ? left.genericity.elements.length : 0;
                const rGens = right.genericity ? right.genericity.elements.length : 0;
                if( lGens > 0 && lGens !== rGens ){
                    right.throwError(`the '${left.value()}' ${type} generics is not consistent with the ${type} generics in the ${interfaceModule.getName()}`);
                }
                if( lGens > 0 ){
                    const result= left.genericity.elements.every( (leftGeneric,index)=>{
                        const rightGeneric = right.genericity.elements[index];
                        if( !rightGeneric )return false;
                        if( leftGeneric.extends ){
                            return rightGeneric.extends ? leftGeneric.type().constraint( rightGeneric.type() ) : false;
                        }
                        return true;
                    });
                    if( !result ){
                        right.throwError(`the '${left.value()}' ${type} generics does not satisfy the constraints with the ${type} generics in the ${interfaceModule.getName()}`);
                    }
                }
            }
            if( right.modifier && right.modifier.value() !=="public" ){
                right.throwError(`the '${right.value()}' ${type} modifier is not consistent with the ${type} modifier in the ${interfaceModule.getName()}`);
            }
        }
        if( interfaceModule !== this.compilation.module ){
            const members = interfaceModule.members || {};
            for(var name in members){
                const left = members[name];
                if( left.isAccessor ){
                    check(left.get,this.compilation.module.getMember(name,"get"));
                    check(left.set,this.compilation.module.getMember(name,"set"));
                }else{
                    check(left,this.compilation.module.getMember(name));
                }
            }
        }
        interfaceModule.extends.forEach( item=>{
            this.implementCheck(item,grammar);
        });
        interfaceModule.implements.forEach( item=>{
            this.implementCheck(item,grammar);
        });
    }

    parser(grammar){
        this.body.forEach(item =>{
            item.parser(grammar);
        });
    }

    check(grammar){
        this.implementCheck( this.compilation.module );
    }
}

module.exports = ClassDeclaration;