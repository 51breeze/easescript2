class Type
{
    constructor( id , _extends)
    {
        this._id = id;
        this._extends= _extends || [];
        this.alias = null;
        this.constructor = null;
    }

    set id(name)
    {
        this._id = name;
    }

    get id()
    {
        return this._id;
    }

    set extends( _extends )
    {
        if( _extends )
        {
            if( _extends instanceof Array){
                this._extends=_extends;
            }else{
                this._extends=[_extends];
            }
        }
    }

    get extends()
    {
        return this._extends;
    }

    is( type )
    {
        if( !type )return false;
        const left  = this.id;
        const right = type.id;

        if( left===right || (left==="Class" && type instanceof Type && type.constructor) )
        {
            return true;
        }

        const check = ( inherits )=>{
            if( inherits )
            {
                for(var parent of inherits)
                {
                    if( right === parent.description.id )
                    {
                        return true;
                    }

                    if( parent.description instanceof Type && check( parent.description.extends ) )
                    {
                        return true;
                    }
                }
            }
            return false;
        }
        return check( this.extends );
    }
}
module.exports = Type;