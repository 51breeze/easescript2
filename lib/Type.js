const Stack = require("./Stack");
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

        if( left===right || (left==="Class" && type.isModule && type.methodConstructor) ){
            return true;
        }

        if( this.isInterface && type.isModule){
            const getImps=( type )=>{
                let imps = [ type ];
                if( type.extends[0] ){
                    imps.push( type.extends[0] );
                }
                if(type.isModule && type.implements && type.implements.length > 0){
                    type.implements.forEach( item=>{
                        imps = imps.concat( getImps(item) );
                    });
                }
                return imps;
            }
            const leftImps = getImps(this);
            const rightImps = getImps(type);
            return leftImps.every( item=>rightImps.includes(item) );
        }

        const check = (left,right)=>{
            if( left.id === right.id ){
                return true;
            }
            const inherits = left.extends;
            if(inherits && inherits.some(parent=>check(parent, right))){
                return true;
            }
            if(left.isModule && left.implements){
                return left.implements.every( item=>item.is(type) );
            }
            return false;
        }
        return check(this,type);
    }

    toString(){
        return this._id;
    }
}
module.exports = Type;