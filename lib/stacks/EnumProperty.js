const Stack = require("../Stack");
class EnumProperty extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.isEnumProperty= true;
        this.increment = parentStack.increment++;
        const value=()=>this.increment;
        this.right={value,raw:value,emit:value};
    }

    reference(){
        return this;
    }

    description(){
        return this;
    }

    type(){
        return this.compilation.getType("Number");
    }

    emit(syntax){
        return this.increment;
    }
}

module.exports = EnumProperty;