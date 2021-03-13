const Utils = require("../Utils");
const FunctionExpression = require("./FunctionExpression");
class FunctionDeclaration extends FunctionExpression{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isFunctionDeclaration= true;
        this.key = Utils.createStack(compilation,node.id,scope,node,this);
        scope.define( this.key.value(), this );
        if( node.type==="FunctionDeclaration" ){
            this.scope.define("this", compilation.getType("Object") );
        }
    }
    definition(){
        const type = this.type().toString();
        const identifier = this.key.value();
        const context = this;
        const params  = this.params.map( item=>`${item.raw()}:${item.type().toString()}`);
        return {
            kind:"function",
            comments:context.comments,
            identifier:identifier,
            expre:`function ${identifier}(${params.join(",")}):${type}`,
            location:this.key.getLocation(),
            file:this.compilation.module.file,
            context
        };
    }
    emit(syntax){
        return syntax.builder(this,"FunctionExpression");
    }
}

module.exports = FunctionDeclaration;