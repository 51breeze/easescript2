const Stack = require("../Stack");
const Utils = require("../Utils");
class PropertyDefinition extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.metatypes = [];
        this.annotations = [];
        this.kind = node.kind;
        this.modifier = Utils.createStack( compilation, node.modifier, scope, node,this );
        this.static  = Utils.createStack(compilation,node.static,scope,node,this);
        this.declarations = node.declarations.map( item=>{
            return Utils.createStack( compilation, item, scope, node,this );
        });
        compilation.module.addMember(this.declarations[0].id.value(), this);
    }

    get init(){
        this.declarations[0].init;
    }

    get id(){
        return this.declarations[0].id.value();
    }

    parser(syntax){
        this.declarations[0].parser(syntax)
    }

    value(){
        return this.declarations[0].value();
    }

    raw(){
        return this.declarations[0].raw();
    }

    emit(syntax) {
        const id = this.id;
        const init = this.init ? this.init.emit(syntax) : null;
        return init ? `${id}=${init}` : id;
    }
}

module.exports = PropertyDefinition;