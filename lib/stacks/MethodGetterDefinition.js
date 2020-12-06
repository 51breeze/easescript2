const MethodDefinition = require("./MethodDefinition");
class MethodGetterDefinition extends MethodDefinition{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.callable = false
    }

    parser(syntax){
        super.parser(syntax);
        if( this.value.params.length != 0 ){
            this.throwError(`"${this.key.value()}" getter does not set param`);
        }
    }

    type(){
        return this.value.returnType ? this.value.returnType.type() : this.compilation.getType("any");
    }
}

module.exports = MethodGetterDefinition;