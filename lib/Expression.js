const Type = require("./Type");
class Expression extends Type 
{
    constructor( type, target=null )
    {
        super(type,target)
    }
}
module.exports = Expression;