const Stack = require("../Stack");
const Utils = require("../Utils");
const Declarator = require("./Declarator");
class ReturnStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.argument = Utils.createStack( compilation, node.argument, scope, node,this );
        const fnScope = scope.getScopeByType("function");
        fnScope.returnItems.push( this );
    }

    reference(){
        const description = this.description();
        if( description instanceof Declarator ){
            return description.reference();
        }
        return description;
    }

    description(){
        return this.argument ? this.argument.description() : null;
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