class Type
{
    constructor( id , _extends)
    {
        this._id = id;
        this._extends= _extends || [];
    }

    set id(name){
         this._id = name;
    }

    get id(){
        return this._id;
    }

    set extends( _extends )
    {
        if( _extends ){
            this._extends=_extends;
        }
    }

    get extends()
    {
        return this._extends;
    }

    is( type )
    {
        if( this.id === type.id )
        {
            return true;
        }
        const check = ( inherits )=>{
            if( inherits )
            {
                for(var parent of inherits)
                {
                    const typename = typeof parent ==="string" ?  parent : parent.id;
                    if( type.id === typename )
                    {
                        return true;
                    }
                    if( parent instanceof Type && check( parent.extends ) )
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