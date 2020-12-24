const Type = require("./Type");
const Stack = require("./Stack");
class GenericType extends Type{
    constructor( id , scope ){
        super(id);
        this.isGenericType=true;
        this.acceptType = null;
        this.scope = scope;
    }
    check(stack){
        if( stack instanceof Stack){
            const type = stack.type();
            if( type && type.scope === this.scope ){
                return true;
            }
        }
        return this.acceptType ? this.acceptType.check(stack) : false;
    }

    is( type ){
        if( type && type.scope === this.scope){
            return true;
        }
        return this.acceptType ? this.acceptType.is(type) : false;
    }

}
module.exports = GenericType;