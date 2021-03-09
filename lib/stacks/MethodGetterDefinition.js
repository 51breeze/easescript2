const MethodDefinition = require("./MethodDefinition");
class MethodGetterDefinition extends MethodDefinition{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isMethodGetterDefinition= true;
        this.callable = false
        this.isAccessor = true;
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