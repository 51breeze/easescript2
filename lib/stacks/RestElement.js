const Declarator = require("./Declarator");
const TupleType = require("../TupleType");
class RestElement extends Declarator{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node.argument,scope,parentNode,parentStack);
        this.isRestElement= true;
        scope.define(node.name, this);
    }
    type(){
        return this.acceptType ? this.acceptType.type() : new TupleType( this.compilation.getType("any") , true );
    }
}

module.exports = RestElement;