const Namespace = require("./Namespace");
class Type
{
    constructor( name, target=null )
    {
        this.name = name;
        this.target = target;
    }

    is( typeName )
    {
        Namespace.fetch( typeName );
    }
}
module.exports = Type;