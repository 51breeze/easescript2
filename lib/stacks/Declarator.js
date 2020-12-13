const Stack = require("../Stack");
const Utils = require("../Utils");
class Declarator extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.acceptType =  Utils.createStack( compilation, node.acceptType, scope, node ,this);
        this.assignValue = null;
        this._kind = "var";
    }

    set kind(value){
       this._kind=value;
    }

    get kind(){
        return this._kind;
    }

    reference(){
        return this.assignValue ? this.assignValue.reference() : null;
    }

    description(){
        return this.acceptType || this.assignValue;
    }

    type(){
        const value = this.description();
        return value ? value.type() : this.compilation.getType("any");
    }

    parser( syntax ){
        if( this.acceptType  ){
            this.acceptType.parser();
        }
    }

    assignment( value ){
        const acceptType = this.acceptType ? this.acceptType.type() : null;
        if( acceptType && !acceptType.check( value ) ){
            this.throwError(`"${this.raw()}" of type "${acceptType.toString()}" is not assignable to assignment of type "${value.type().toString()}"`);
        }else if( this.assignValue && !this.assignValue.type().check( value ) ){
            this.throwError(`"${this.raw()}" of type "${this.assignValue.type().toString()}" is not assignable to assignment of type "${value.type().toString()}"`);
        }
        this.assignValue = value;
    }
    emit( syntax ){
        return this.node.name;
    }
}

module.exports = Declarator;