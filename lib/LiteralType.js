const Stack = require("./Stack");
const Type = require("./Type");
class LiteralType extends Type{
    constructor(inherit,properties={}){
        super("LiteralType",[inherit])
        this.isLiteralType = true;
        this.properties = properties;
    }
    check( stack ){
        if(stack instanceof Stack){
            const stackItems = stack.referenceItems();
            return stackItems.every( stack=>{
                return this.constraint( stack );
            });
        }
        return false;
    }

    attribute( property ){
        if( this.properties && this.properties.hasOwnProperty(property) ){
            return this.properties[property];
        }
        return null;
    }

    constraint( stack ){
        const type = stack.type();
        if( this === type )return true;
        if( !(stack.isArrayExpression || stack.isObjectExpression || stack.isTypeObjectExpression) )return false;
        const inherit = this.extends[0];
        if( inherit.is( type ) ){
            if( this.properties ){
                for( var name in this.properties){
                    const left = this.properties[name];
                    const right = stack.attribute(name);
                    if( !right || !left.type().check( right ) )return false;
                }
            }
            return true;
        }
        return false;
    }

    is( type ){
        if( !type || !type.isLiteralType )return false;
        if( this === type )return true;
        const inherit = this.extends[0];
        if( inherit.is( type.extends[0] ) ){
            if( this.properties ){
                for( var name in this.properties){
                    const left = this.properties[name];
                    const right = type.properties[name];
                    if( !right || !left.type().is( right.type() ) )return false;
                }
            }
            return true;
        }
        return false;
    }

    toString(){
        const properties = [];
        const inherit = this.extends[0];
        if( this.properties ){
            for( var name in this.properties){
                const left = this.properties[name];
                properties.push( `${name}:` + left.type().toString() );
            }
        }
        if( inherit && properties.length > 0){
            return `${inherit.id} {${properties.join(',')}}`;
        }
        return inherit ? inherit.id : this.id;
    }
}
module.exports = LiteralType;