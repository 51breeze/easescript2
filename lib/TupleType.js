const Type = require("./Type.js");
const Utils = require("./Utils");
class TupleType extends Type
{
    constructor( types , rest = false ){
        super("Tuple");
        this.elements = [].concat(types);
        const len = this.elements.length;
        this.rest = rest;
        this.requireCount = rest && len > 1 ? len-1 : len;
    }

    check( stack, someFlag = false){

        if( someFlag ){
            return this.elements.some( (type)=>{
                return type.check( stack );
            });
        }

        let items = stack;
        if( !(stack instanceof Array) ){
            const stackType = stack.type();
            if( stackType instanceof TupleType ){
                return this.is( stackType );
            }
            const refe = stack.reference();
            if( Utils.isStackByName(refe,"ArrayExpression") ){
                items = refe.elements;
            }else{
                items = [stack];
            }
        }

        const len = this.elements.length;
        if( len === 1 ){
            return items.every( (item)=>{
                return this.elements[0].check( item );
            });
        }

        if( items.length < this.requireCount ){
            return false;
        }

        const rest = this.elements[ len-1 ].rest ? this.elements[ len-1 ] : null;
        return items.every( (item,index)=>{
            const base = this.elements[index];
            if( base && base !== rest ){
                return base.check( item );
            }else{
                if( rest ){
                    return rest.check( item );
                }else{
                    return this.elements.some( (type)=>{
                        return type.check( item );
                    });
                }
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

    toString(){
        const elements = this.elements.map( (item)=>{
            return item.toString();
        });
        const rest = this.rest ? '...' : '';
        if( elements.length === 1 ){
            return `${rest}${elements[0]}[]`;
        }
        return `${rest}(${elements.join(' | ')})[]`;
    }
}
module.exports = TupleType;