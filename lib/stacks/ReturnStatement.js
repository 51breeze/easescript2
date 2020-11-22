const Stack = require("../Stack");
const Utils = require("../Utils");
class ReturnStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.argument = Utils.createStack( compilation, node.argument, scope, node,this );
        const fnScope = scope.getScopeByType("function");
        fnScope.returnItems.push( this );
    }

    type(){
        return this.argument.type();
    }

    parser(syntax){
        return this.argument.parser(syntax);
    }

    emit(syntax){
        const argument = this.argument.emit(syntax);
        return `return ${argument}`;
    }
}

module.exports = ReturnStatement;