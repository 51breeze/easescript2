const Declarator = require("./Declarator");
const TupleType = require("../TupleType");
class RestElement extends Declarator{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node.argument,scope,parentNode,parentStack);
        scope.define(node.name, this);
    }
    
    type(){
        const value = this.description();
        return value ? value.type() : new TupleType( this.compilation.getType("any") );
    }
}

module.exports = RestElement;