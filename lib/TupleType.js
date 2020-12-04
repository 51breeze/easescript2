const Type = require("./Type.js");
const Utils = require("./Utils");
class TupleType extends Type
{
    constructor( types , lastRest=false){
        super("Array");
        this.elements = [].concat(types);
        this.lastRest = lastRest;
    }

    in( type, index=-1){
        if( index < this.elements.length && index >= 0 ){
            const host  = this.elements[ index ];
            return host instanceof TupleType ? host.check( type ) : host.is( type );
        }
        return this.elements.some( (host)=>{
            return host instanceof TupleType ? host.check( type ) : host.is( type );
        });
    }

    check( stack ){

        let stacks = stack;
        if( !(stack instanceof Array) ){
            const desc = stack.description();
            stacks = Utils.isStackByName(desc,"ArrayExpression") ? desc.elements : [stack];
        }

        if( this.elements.length ===1 && this.lastRest ){
            const baseType = this.elements[0];
            return stacks.every( (item)=>{
                return baseType.check( item );
            });
        }

        if( stacks.length < this.elements.length ){
            return false;
        }

        return stacks.every( (item,index)=>{
            const baseType = this.elements[index];
            if( baseType ){
                return baseType.check( item );
            }else{
                return this.elements.some( (host)=>{
                    return host.check( item );
                });
            }
        });
    }

    is( type ){
        if( !type )return false;
        if( !(type instanceof TupleType) || this.elements.length !== type.elements.length ){
            return false;
        }
        return this.elements.every( (item,index)=>{
            return item.is( type.elements[ index ] );
        });
    }
}
module.exports = TupleType;