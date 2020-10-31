const Type = require("./Type.js");
class VoidType extends Type
{
    constructor()
    {
        super("void");
    }

    is(){
        return false;
    }
}
module.exports = VoidType;