const Stack = require("../Stack");
const Utils = require("../Utils");
class PropertyDefinition extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isPropertyDefinition= true;
        this.metatypes = [];
        this.annotations = [];
        this.kind = node.kind;
        this.modifier = Utils.createStack( compilation, node.modifier, scope, node,this );
        this.static  = Utils.createStack(compilation,node.static,scope,node,this);
        this.declarations = node.declarations.map( item=>{
            return Utils.createStack( compilation, item, scope, node,this );
        });
        this.isProperty=true;
        compilation.module.addMember(this.declarations[0].id.value(), this);
    }

    get init(){
        return this.declarations[0].init;
    }

    get id(){
        return this.declarations[0].value();
    }

    reference(){
        return this.declarations[0].reference();
    }

    description(){
        return this.declarations[0].description();
    }

    type(){
        return this.declarations[0].type();
    }

    parser(syntax){
        this.declarations[0].parser(syntax)
    }

    throwError(message){
        this.declarations[0].throwError(message)
    }
    throwWarn(message){
        this.declarations[0].throwWarn(message)
    }

    value(){
        return this.declarations[0].value();
    }

    raw(){
        return this.declarations[0].raw();
    }
}

module.exports = PropertyDefinition;