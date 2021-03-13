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
    definition(){
        return {
            expre:`any`
         };
    }
    is(){
       return true;
    }
}
module.exports = AnyType;