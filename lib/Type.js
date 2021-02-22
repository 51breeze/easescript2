const Stack = require("./Stack");
class Type
{
    constructor( id , _extends)
    {
        this._id = id;
        this._extends= _extends || [];
        this.alias = null;
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

        if( left===right || (left==="Class" && type.isModule && type.isClass) ){
            return true;
        }

        if( this.isModule && this.isClass && right ==="Object"){
            return true;
        }

        if( this.isInterface && type.isModule){
            const checkImp=(type)=>{
                if(!type){
                    return false;
                }
                if( type.id === left || checkImp(type.extends[0]) ){
                    return true;
                }
                if(type.isModule && type.implements && type.implements.length > 0){
                    return type.implements.some(item=>checkImp(item));
                }
            }
            return checkImp(type);
        }

        const check = (left,right)=>{
            if( left.id === right.id ){
                return true;
            }
            if(left.extends && left.extends.some(parent=>check(parent, right))){
                return true;
            }
            if(left.isModule && left.implements){
                return left.implements.some(item=>check(item,right));
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