const Type = require("./Type");
class Expression extends Type 
{
    constructor(node, value, type, target=null)
    {
        super( type );
        this.value= value;
        this.node = node;
        this.target= target;
    }
}

module.exports = Expression;