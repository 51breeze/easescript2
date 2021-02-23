const Type = require("./Type.js");
class VoidType extends Type
{
    constructor()
    {
        super("void");
        this.isVoidType = true;
    }

    is(){
        return false;
    }
}
module.exports = VoidType;