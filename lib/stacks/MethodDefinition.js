const Stack = require("../Stack");
const Utils = require("../Utils");
class MethodDefinition extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this._metatypes = [];
        this._annotations = [];
        this.static  = Utils.createStack(compilation,node.static,scope,node,this);
        this.key     = Utils.createStack(compilation,node.key,scope,node,this);
        this.expression   = Utils.createStack(compilation,node.value,scope,node,this);
        this.modifier= Utils.createStack(compilation,node.modifier,scope,node,this);
        this.callable = true;
        this.expression.key = this.key;
        this.scope = this.expression.scope;
        this.kind = node.kind
        if( this.key.value() ==="constructor" ){
            this.expression.isConstructor = true;
        }
        if( !this.static ){
            this.expression.scope.define("this", compilation.module);
        }
        compilation.module.addMember(this.key.value(), this);
    }

    set metatypes(value){
        this._metatypes = value;
        this.compilation.module.metatypes = value.map( item=>{
            const name = item.name;
            const description = item.description();
            if( name==="Callable" && this.key.value() ==="constructor" ){
                this.compilation.module.callable={
                    params:description.params,
                    callable:true,
                    isConstructor:true,
                    stack:this,
                    description(){
                        return this;
                    },
                    type(){
                        return description.returnType || this.compilation.module;
                    }
                }
            }
            return description;
        });
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

    reference(){
        return this.expression.reference();
    }

    description(){
        return this;
    }

    type(){
        if( this.key.value() ==="constructor" ){
            return this.compilation.module;
        }
        return this.expression.type();
    }

    value(){
        return this.key.value(); 
    }

    parser(syntax){
        this.expression.parser(syntax);
    }

    emit(syntax){
        return this.expression.emit(syntax);
    }
}

module.exports = MethodDefinition;