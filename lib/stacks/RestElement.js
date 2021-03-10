const Declarator = require("./Declarator");
const TupleType = require("../TupleType");
class RestElement extends Declarator{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node.argument,scope,parentNode,parentStack);
        this.isRestElement= true;
        scope.define(node.name, this);
    }
    definition(){
        const type = this.type().toString();
        const identifier = this.value();
        const context = this;
        return {
            kind:this.kind,
            comments:context.comments,
            identifier:identifier,
            expre:`${this.kind} ${identifier}:${type}`,
            type:type,
            start:this.node.start,
            end:this.node.end,
            file:this.compilation.module.file,
            context
        };
    }
    type(){
        return this.acceptType ? this.acceptType.type() : new TupleType( this.compilation.getType("any") , true );
    }
}

module.exports = RestElement;