const FunctionExpression = require("./FunctionExpression");
class ArrowFunctionExpression extends FunctionExpression{
    constructor(compilation,node,scope,parentNode,parentStack)
    {
         super(compilation,node,scope,parentNode,parentStack);
         this.isArrowFunctionExpression=true;
         this.isExpression = !!node.expression;
         this.isArrowFunction=true;
         this.scope.isArrow = true; 
         this.scope.isExpression = this.expression;
    }
    definition(){
        const type = this.type().toString();
        const params  = this.params.map( item=>`${item.raw()}:${item.type().toString()}`);
        return {
            expre:`(${params.join(",")})=>${type}`,
            file:this.compilation.module.file,
        };
    }
    emit(syntax){
        return syntax.builder(this,"FunctionExpression");
    }
}

module.exports = ArrowFunctionExpression;