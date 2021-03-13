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
        const kind = this.parentStack.isFunctionExpression ? "(parameter)" : this.kind;
        return {
            kind:kind,
            comments:context.comments,
            identifier:identifier,
            expre:`${kind} ...${identifier}:${type}`,
            location:this.getLocation(),
            file:this.compilation.module.file,
            context
        };
    }
    type(){
        return this.acceptType ? this.acceptType.type() : new TupleType( this.compilation.getType("any") , true );
    }
}

module.exports = RestElement;