const MethodDefinition = require("./MethodDefinition");
class MethodGetterDefinition extends MethodDefinition{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isMethodGetterDefinition= true;
        this.callable = false
        this.isAccessor = true;
    }
    definition(){
        const type = this.type().toString();
        const identifier = this.key.value();
        const context = this;
        const modifier = this.modifier ? this.modifier.value() : "public";
        const owner = this.compilation.module.getName();
        const _static = this.static ? 'static ' : '';
        return {
            kind:"getter",
            comments:context.comments,
            identifier:identifier,
            expre:`${_static}${modifier} get ${owner}.${identifier}():${type}`,
            type:type,
            start:this.key.node.start,
            end:this.key.node.end,
            file:this.compilation.module.file,
            context
        };
    }
    check(){
        super.check();
        if( this.expression.params.length != 0 ){
            this.throwError(`"${this.key.value()}" getter does not set param`);
        }
        if( this.scope.returnItems.length < 1 ){
           this.throwError(`"${this.key.value()}" getter accessor must have a return expression`);
        }
    }
}

module.exports = MethodGetterDefinition;