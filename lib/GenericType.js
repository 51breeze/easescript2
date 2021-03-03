const Type = require("./Type");
class GenericType extends Type{
    constructor( id , scope , inherit=null){
        super(id, inherit ? [inherit] : null );
        this.isGenericType=true;
        this.acceptType = null;
        this.hasConstraint = !!inherit;
        this.scope = scope;
    }
    get id(){
        const inherit = this.extends[0];
        if( inherit ){
            return inherit.id;
        }
        return super.id;
    }
    attribute( property ){
        const inherit = this.extends[0];
        if( !inherit ){
            return null;
        }
        if( inherit.isLiteralType ){
            return inherit.attribute( property );
        }
        if( inherit.isModule ){
            return inherit.getMember(property,"get");
        }
        return null;
    }
    accept(type){
        if( this.extends.length ===0 ){
           this.acceptType = type;
        }
    }
    constraint( type ){
        const inherit = this.extends[0];
        if( !inherit )return true;
        if( type.isGenericType){
            type = type.extends[0] || type.acceptType;
            if( !type ){
                return false;
            }
        }
        if( type === this || type === inherit){
            return true;
        }
        if(type.isModule && inherit.isModule){
            if( type.isClass && type.is(inherit) ){
                return true;
            }
            return inherit.is(type);
        }
        return false;
    }
    check(stack){
        const inherit = this.extends[0];
        if( inherit ){
            return inherit.check( stack );
        }else if( this.acceptType ){
            return this.acceptType.check( stack );
        }
        return true;
    }
    is( type ){
        if( type === this)return true;
        const inherit = this.extends[0];
        if( inherit ){
            return inherit.is( type );
        }else if( this.acceptType ){
            return this.acceptType.is(type);
        }
        return true;
    }
    toString(){
        const inherit = this.extends[0];
        if(inherit){
           return inherit.toString();
        }
        return super.toString();
    }

}
module.exports = GenericType;