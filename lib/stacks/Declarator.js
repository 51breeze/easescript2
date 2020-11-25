const Stack = require("../Stack");
const Utils = require("../Utils");
class Declarator extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.acceptType =  Utils.createStack( compilation, node.acceptType, scope, node ,this);
        this.assignValue = null;
    }

    description(){
        return this.acceptType || this.assignValue;
    }

    type(){
        const value = this.description();
        return value ? value.type() : null;
    }

    parser( syntax ){
        if( this.acceptType  ){
            this.acceptType.parser();
        }
    }

    assignment( value ){   
        const acceptType = this.acceptType ? this.acceptType.type() : null;
        if( acceptType && !acceptType.is( value.type() ) ){
            this.compilation.throwErrorLine(`At {code}\r\n "${this.raw()}" type not match of assign value.`, this.node);
        }else if( this.assignValue && !this.assignValue.type().is( value.type() ) ){
            this.compilation.throwErrorLine(`At {code}\r\n "${this.raw()}" type not match of assign value.`, this.node);
        }
        this.assignValue = value;
    }
}

module.exports = Declarator;