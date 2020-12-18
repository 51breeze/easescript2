const MethodDefinition = require("./MethodDefinition");
class MethodSetterDefinition extends MethodDefinition{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.callable = false;
        this.assignValue = null;
    }

    parser(syntax){
        super.parser(syntax);
        if( this.expression.params.length != 1 ){
            this.throwError(`"${this.key.value()}" setter must have one param`);
        }
        const param = this.expression.params[0];
        const type = param.acceptType ? param.acceptType.type() : this.compilation.getType("any");
        const desc = this.compilation.getReference(this.key.value(), this.compilation.module, !!this.static , "get");
        const returnType = desc.type()
        if( returnType !== type ){
            this.throwError(`"${this.key.raw()}" setter and getter parameter types do not match`);
        }
    }

    type(){
        return this.compilation.getType("void");
    }

    assignment( value, stack=null ){
        const param = this.expression.params[0];
        let acceptType = param.acceptType ? param.acceptType.type() : null;
        if( !acceptType ){
           const desc = this.compilation.getReference(this.key.value(), this.compilation.module, !!this.static , "get");
           acceptType = desc ? desc.type() : null;
        }
        if( acceptType && !acceptType.check( value ) ){
            (stack||this).throwError(`"${this.key.raw()}" not match of type ${acceptType.toString()} to assignment type ${value.type().toString()}.`);
        }else if( this.assignValue && !this.assignValue.type().check( value ) ){
            (stack||this).throwError(`"${this.key.raw()}" not match of type ${this.assignValue.type().toString()} to assignment type ${value.type().toString()}.`);
        }
        this.assignValue = value;
    }
}

module.exports = MethodSetterDefinition;