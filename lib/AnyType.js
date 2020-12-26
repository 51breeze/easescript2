const Type = require("./Type.js");
class AnyType extends Type
{
    constructor(){
        super("any");
        this.isAny = true;
    }
    check(){
        return true;
    }
    is(){
       return true;
    }
}
module.exports = AnyType;