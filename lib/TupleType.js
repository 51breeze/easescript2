const Type = require("./Type.js");
class TupleType extends Type
{
    constructor( types )
    {
        super("Array");
        this.elements = types;
    }

    in( type, index=-1)
    {
        if( index < this.elements.length && index >= 0 )
        {
            const host  = this.elements[ index ].description;
            return host instanceof TupleType ? host.check( type ) : host.is( type.description );
        }
        return this.elements.some( (item)=>{
            const host  = item.description;
            return host instanceof TupleType ? host.check( type ) : host.is( type.description );
        });
    }

    check( value )
    {
        if( !value.description || value.description.id !=="Array" )
        {
            return false;
        }
        return value.elements.every( (item,index)=>{
            return this.in(item, index);
        });
    }

    is( type )
    {
        if( !type )return false;
        if( !(type instanceof TupleType) || this.elements.length !== type.elements.length )
        {
            return false;
        }
        return this.elements.every( (item,index)=>{
            return item.description.is( type.elements[ index ].description );
        });
    }
}
module.exports = TupleType;