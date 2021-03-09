const Stack = require("../Stack");
const Utils = require("../Utils");
class MethodDefinition extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isMethodDefinition= true;
        this._metatypes = [];
        this._annotations = [];
        this.isMethod=true;
        this.static  = Utils.createStack(compilation,node.static,scope,node,this);
        this.key     = Utils.createStack(compilation,node.key,scope,node,this);
        const name = this.key.value();
        if( name ==="constructor" || name === compilation.module.id ){
            this.isConstructor = true;
            this.callable = false;
            if( node.key.genericity ){
                this.key.throwError(`Type parameters cannot appear on a constructor declaration.`);
            }
        }else{
            this.callable = true;
        }
        this.expression = Utils.createStack(compilation,node.value,scope,node,this);
        this.modifier= Utils.createStack(compilation,node.modifier,scope,node,this);
        this.override = Utils.createStack(compilation,node.override,scope,node,this); 
        this.expression.key = this.key;
        this.scope = this.expression.scope;
        this.kind = node.kind;
        if( !this.static ){
            this.expression.scope.define("this", compilation.module);
        }
        compilation.module.addMember(name, this);
    }

    set metatypes(value){
        this._metatypes = value;
        const id = this.key.value();
        if( id ==="constructor" || id === this.compilation.module.id ){
            value.forEach( item=>{
                const name = item.name;
                const description = item.description();
                if( name==="Callable" && this.key.value() ==="constructor" ){
                    this.callable = true;
                    this.compilation.module.callable={
                        params:description.params,
                        callable:true,
                        isConstructor:true,
                        stack:this,
                        returnType:description.returnType,
                        description(){
                            return this;
                        },
                        type(){
                            return description.returnType || this.compilation.module;
                        }
                    }
                }
            });
        }
    }

    get metatypes(){
       return this._metatypes; 
    }

    set annotations(value){
        this._annotations = value;
    }

    get annotations(){
        return this._annotations;
    }

    get params(){
        return this.expression.params;
    }

    get body(){
        return this.expression.body;
    }

    get genericity(){
        return this.expression.genericity;
    }

    reference(){
        return this.expression.reference();
    }
    referenceItems(){
        return this.expression.referenceItems();
    }
    description(){
        return this;
    }
    throwError(message){
        this.key.throwError(message)
    }
    throwWarn(message){
        this.key.throwWarn(message)
    }

    type(){
        const name = this.key.value();
        if( name ==="constructor" || name === this.compilation.module.id ){
            return this.compilation.module;
        }
        return this.expression.type();
    }

    get returnType(){
        return this.expression.returnType;
    }

    value(){
        return this.key.value(); 
    }

    check(){
        const parent = this.compilation.module.extends[0];
        if( this.override ){
            if( !parent || !parent.getMember( this.key.value() ) ){
                this.key.throwError(`"${this.key.value()}" does not exists in parent class. remove the "override" modifier if is not overwrite.`)
            }
        }else if( parent ){
            const parentMethod = parent.getMember( this.key.value() );
            if( parentMethod && parentMethod.modifier.value() !=="private" ){
                this.key.throwError(`"${this.key.value()}" already exists in parent class. use the "override" modifier if need overwrite`)
            }
        }
    }

    parser(grammar){
        this.check();
        this.expression.parser(grammar);
    }

    emit(syntax){
        this.check();
        return this.expression.emit(syntax);
    }
}

module.exports = MethodDefinition;