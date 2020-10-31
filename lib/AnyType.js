const Type = require("./Type.js");
class AnyType extends Type
{
    constructor()
    {
        super("any");
    }
    is()
    {
       return true;
    }
}
module.exports = AnyType;