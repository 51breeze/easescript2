const Namespace = require("./Namespace");
class Type
{
    constructor( name, target=null )
    {
        this.name = name;
        this.target = target;
    }

    has( key , isStatic )
    {
        if( this.target ) 
        {
            return this.target.hasOwnProperty( key );
        }

        const target = Namespace.fetch( this.name );
        if( target )
        {
            if( isStatic ){
               return !!target.getMethod(key);
            }
           return !!target.getMember(key);
        }
        return false;
    }

    is( typeName )
    {
        Namespace.fetch( typeName );
    }
}
module.exports = Type;