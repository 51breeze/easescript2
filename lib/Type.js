const Stack = require("./Stack");
const Utils = require("./Utils");
class Type
{
    constructor( id , _extends)
    {
        this._id = id;
        this._extends= _extends || [];
        this.alias = null;
        this.methodConstructor = null;
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

    check( stack ){
        if(stack instanceof Stack){
            return this.is( stack.type() );
        }
        return false;
    }

    is( type )
    {
        if( !type )return false;
        const left  = this.id;
        const right = type.id;

        if( left===right || (left==="Class" && type instanceof Type && type.methodConstructor) )
        {
            return true;
        }

        const check = ( inherits )=>{
            if( inherits )
            {
                for(var parent of inherits)
                {
                    if( right === parent.id )
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

    toString(){
        return this._id;
    }
}
module.exports = Type;