const Type = require("./Type");
class Expression extends Type 
{
    constructor(type, target=null )
    {
        super(type);
        this.target = target;
    }
}
module.exports = Expression;