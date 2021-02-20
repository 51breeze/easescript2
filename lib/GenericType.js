const Type = require("./Type");
const Stack = require("./Stack");
class GenericType extends Type{
    constructor( id , scope , inherit=null){
        super(id, inherit ? [inherit] : null );
        this.isGenericType=true;
        this.acceptType = null;
        this.scope = scope;
    }
    get id(){
        const inherit = this.extends[0];
        if( inherit ){
            return inherit.id;
        }
        return super.id;
    }

    accept(type){
        if( this.extends.length ===0 ){
           this.acceptType = type;
        }
    }
    constraint( type ){
        const inherit = this.extends[0];
        if( !inherit ){
            return true;
        }

        if( type instanceof GenericType){
            type = type.extends[0];
            if( !type ){
                return false;
            }
        }

        if( type === this || type === inherit){
            return true;
        }

        
        if(type.isModule && inherit.isModule){
            if( type.id === inherit.id ){
                return true;
            }
            if( type.isInterface && inherit.implements.some(item=>item===type)){
                return true;
            }

           const members = inherit.members;
           for(var name in members){
               const left = members[name];
               const right = type.members[name];
               if( !right ){
                   return false;
               }
               if( left.isAccessor && ( (left.get && !right.get) || (left.set && !right.set) ) ){
                    return false;
               }else if( left.isMethod ){
                    if( !right.isMethod || left.params.length !== right.params.length){
                        return false;
                    }
                    const leftType = left.type();
                    const rightType =  right.type();
                    if( leftType !== rightType && !leftType.is( rightType ) ){
                        return false;
                    }
                    if( !left.params.every( (item,index)=>item.type().is( right.params[index].type() ) ) ){
                        return false;
                    }
               }
           }
           return true;
        }
        return false;
    }
    check(stack){
        if( stack instanceof Stack){
            const type = stack.type();
            if( type === this ){
                return true;
            }
        }
        const inherit = this.extends[0];
        if( inherit ){
            return inherit.check( stack )
        }
        return this.acceptType ? this.acceptType.check(stack) : false;
    }

    is( type ){
        if( type === this){
            return true;
        }
        const inherit = this.extends[0];
        if( inherit ){
            return inherit.is( type );
        }
        return this.acceptType ? this.acceptType.is(type) : false;
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