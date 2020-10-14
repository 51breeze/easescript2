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

    isNumber( type )
    {
        return ["int","uint","number","float","double"].includes( (type.id||"").toLowerCase() );
    }

    isScalar( type )
    {
        return ["boolean","string"].includes( (type.id||"").toLowerCase() ) || this.isNumber(type);
    }

    is( type )
    {
        if( !type )return false;
        const id = (this.id||"").toLowerCase();
        const typeId = (type.id||"").toLowerCase();
        if( id===typeId || id==="any" || (id==="class" && type instanceof Type) || (id==="number" && this.isNumber(type)) )
        {
            return true;
        }

        if( (id==="object" && this.isScalar(type)) || (id==="boolean" && typeId!==id) || (id==="string" && typeId!==id) )
        {
            return false;
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