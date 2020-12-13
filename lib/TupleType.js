const Type = require("./Type.js");
const Utils = require("./Utils");
class TupleType extends Type
{
    constructor( types, rest=false ){
        super("Array");
        this.rest = rest;
        this.elements = [].concat(types);
        const len = this.elements.length;
        this.requireCount = rest ? len-1 : len;
    }

    check( stack ){

        let stacks = stack;
        if( !(stack instanceof Array) ){
            const desc = stack.description();
            stacks = Utils.isStackByName(desc,"ArrayExpression") ? desc.elements : [stack];
        }

        if( this.elements.length ===1 ){
            const baseType = this.elements[0];
            return stacks.every( (item)=>{
                return baseType.check( item );
            });
        }

        if( stacks.length < this.requireCount ){
            return false;
        }

        const tuple = this.elements[ this.elements.length-1 ];
        const restType = this.rest && tuple instanceof TupleType ? tuple : null;
        return stacks.every( (item,index)=>{
            const baseType = this.elements[index];
            if( baseType && baseType !== restType ){
                return baseType.check( item );
            }else{
                if( restType ){
                    return restType.check( item );
                }else{
                    return this.elements.some( (host)=>{
                        return host.check( item );
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
        const len = this.elements.length-1;
        const elements = this.elements.map( (item,index)=>{
            if( this.rest && index === len ){
               return `...${item.toString()}`;
            }
            return item.toString();
        });
        if( elements.length === 1 ){
            return `${elements[0]}[]`;
        }
        return `[${elements.join(',')}]`;
    }
}
module.exports = TupleType;