const Stack = require("../Stack");
const Utils = require("../Utils");
class TypeObjectProperty extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isTypeObjectProperty= true;
        this.key = Utils.createStack( compilation, node.key,scope, node,this );
        this.init = Utils.createStack( compilation, node.value,scope, node,this );
    }
    definition(){
        return {
            kind:"type",
            comments:this.parentStack.comments,
            identifier:this.key.value(),
            expre:`(property) ${this.key.value()}:${this.type().toString()}`,
            location:this.key.getLocation(),
            file:this.compilation.module.file,
            context:this
        };
    }
    value(){
        return this.key.value();
    }
    type(){
        if( this.init ){
            return this.init.type();
        }
        return this.compilation.getType("any");
    }
    throwError(message){
        this.key.throwError(message);
    }
    throwWarn(message){
        this.key.throwWarn(message);
    }
}

module.exports = TypeObjectProperty;