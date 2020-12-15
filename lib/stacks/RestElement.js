const Declarator = require("./Declarator");
const TupleType = require("../TupleType");
class RestElement extends Declarator{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node.argument,scope,parentNode,parentStack);
        scope.define(node.name, this);
    }
    
    type(){
        const description = this.acceptType || this.assignValue;
        return description ? description.type() : new TupleType( this.compilation.getType("any") , true );
    }
}

module.exports = RestElement;