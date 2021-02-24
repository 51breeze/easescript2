const Stack = require("./Stack");
class Type{
    constructor( id , _extends){
        this._id = id;
        this._extends= _extends || [];
        this.alias = null;
        this.isType = true;
    }
    set id(name){
        this._id = name;
    }
    get id(){
        return this._id;
    }
    set extends( _extends ){
        if( _extends ){
            if( _extends instanceof Array){
                this._extends=_extends;
            }else{
                this._extends=[_extends];
            }
        }
    }
    get extends(){
        return this._extends;
    }
    check( stack,isTupleType,isGeneric ){
        if(stack instanceof Stack){
            const type = stack.type();
            if( isGeneric && this.isInterface && type.isModule && type.isClass ){
                return type.is( this );
            }else{
                return this.is( type );
            }
        }
        return false;
    }
    is( type ){
        if( !type )return false;
        if( this === type )return true;
        return this.id===type.id;
    }
    toString(){
        return this._id;
    }
}
module.exports = Type;