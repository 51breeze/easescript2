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

    check( stacks ){

        if( !(stacks instanceof Array) ){
            const desc = stacks.description();
            stacks = Utils.isStackByName(desc,"ArrayExpression") ? desc.elements : [stacks];
        }

        const len = this.elements.length;
        if( len ===1 ){
            return stacks.every( (item)=>{
                return this.elements[0].check( item );
            });
        }

        if( stacks.length < this.requireCount ){
            return false;
        }

        const restType = this.elements[ len-1 ].rest ? this.elements[ len-1 ] : null;
        return stacks.every( (item,index)=>{
            const baseType = this.elements[index];
            if( baseType && baseType !== restType ){
                return baseType.check( item );
            }else{
                if( restType ){
                    return restType.check( item );
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