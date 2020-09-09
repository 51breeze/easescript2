const Type = require("./Type");


class Expression extends Type 
{
    constructor(node, value, typeName, target=null, type=null, inherit=null)
    {
        super( typeName );
        this.value= value;
        this.node = node;
        this.target= target;
        this.type= type || node.type;
        this.inherit=inherit;
        this.args = null;
    }
}

module.exports = Expression;