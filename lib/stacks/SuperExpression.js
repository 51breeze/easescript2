const Expression = require("./Expression");
class SuperExpression  extends Expression {
    constructor(compilation,node,scope,parentNode,parentStack){ 
        super(compilation,node,scope,parentNode,parentStack);
        node.name = "super";
    }

    reference(){
        return this;
    }

    description(){
        return this.compilation.module.extends[0];
    }

    type(){
        const method = this.getParentStackByName("MethodDefinition");
        console.log( method.value()  )
        return this.compilation.module.extends[0];
    }

    value(){
        return `super`;
    }
    raw(){
        return `super`; 
    }
    parser(){
    }
    emit(syntax){
        const parent = this.compilation.module.extends[0];
        return `${parent.id}.prototype`;
    }
}

module.exports = SuperExpression;