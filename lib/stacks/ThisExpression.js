const Expression = require("./Expression");
class ThisExpression  extends Expression {
    constructor(compilation,node,scope,parentNode,parentStack){ 
        super(compilation,node,scope,parentNode,parentStack);
        this.isThisExpression= true;
        node.name = "this";
    }
    definition(){
        const type = this.type().toString();
        const identifier = this.value();
        const context = this;
        return {
            kind:"this",
            identifier:identifier,
            expre:`this:${type}`,
            location:this.getLocation(),
            file:this.compilation.module.file,
            context
        };
    }
    reference(){
        return this;
    }
    description(){
        return this;
    }
    referenceItems(){
        return [this];
    }
    type(){
        return this.scope.define( this.value() );
    }
    value(){
        return `this`;
    }
    raw(){
        return `this`; 
    }
    check(){
        const desc = this.type();
        if( !desc ){
            this.throwError(`"${this.raw()}" is not defined.`);
        }
    }
}

module.exports = ThisExpression;