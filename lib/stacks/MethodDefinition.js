const Stack = require("../Stack");
const Utils = require("../Utils");
const MethodScope = require("../scope/MethodScope");
class MethodDefinition extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        scope = new MethodScope(scope);
        super(compilation,node,scope,parentNode,parentStack);
        this._metatypes = [];
        this._annotations = [];
        this.static  = Utils.createStack(compilation,node.static,scope,node,this);
        this.key     = Utils.createStack(compilation,node.key,scope,node,this);
        this.value   = Utils.createStack(compilation,node.value,scope,node,this);
        this.modifier= Utils.createStack(compilation,node.modifier,scope,node,this);
        this.callable = true;
        if( !this.static )
        {
            scope.define("this", compilation.module);
        }
        compilation.module.addMember(this.key.value(), this);
        scope.define( this.key.value(), this );
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
                    description(){
                        return this.compilation.module;
                    },
                    type(){
                        return description.returnType;
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
        return this.value.params;
    }

    get body(){
        return this.value.body;
    }

    description(){
        return this;
    }

    type(){
        return this.value.returnType();
    }

    parser(syntax)
    {
        this.value.parser(syntax);
    }

    emit(syntax)
    {
        return this.value.emit(syntax);
    }
}

module.exports = MethodDefinition;