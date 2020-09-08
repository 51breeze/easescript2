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


export class Identifier extends Type
{
    constructor(node,value,target)
    {
        super(target.typeName);
        this.target=target;
        this.value = value;
        this.node = node;
    }
}


export class Literal extends Type
{
    constructor(node, value, type)
    {
        super(type);
        this.value = value;
        this.node = node;
    }
}

export class Enum extends Type
{
    constructor(node, value, inhiert)
    {
        super("Object");
        this.value = value;
        this.node = node;
        this.inhiert= inhiert;
    }
}

export class ForOfStatement
{
    constructor(node, left, right)
    {
        super("Object");
        this.value = value;
        this.node = node;
        this.inhiert= inhiert;
    }
}








module.exports = Expression;