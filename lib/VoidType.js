const Type = require("./Type.js");
class VoidType extends Type
{
    constructor(){
        super("void");
        this.isVoidType = true;
    }
    check(stack){
        if(stack instanceof Stack){
            const type = stack.type();
            return this.is( type );
        }
        return false;
    }
    is( type ){
        if(type === this)return true;
        return type && type.isType && !type.isModule && type.id === "void";
    }
}
module.exports = VoidType;