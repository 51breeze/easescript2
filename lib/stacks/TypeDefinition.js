const Stack = require("../Stack");
const Utils = require("../Utils");
class TypeDefinition extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.valueType = Utils.createStack(compilation,node.value, scope, node, this);
    }

    description(){
        return null;
    }

    type(){
        return this.compilation.getType( this.valueType.value() );
    }

    parser(syntax){
        this.valueType.parser(syntax);
    }

    value(){
        return this.valueType.value(syntax);
    }

    raw(){
        return this.node.name;
    }

    emit(syntax){
        return this.valueType.value();
    }
}

module.exports = TypeDefinition;