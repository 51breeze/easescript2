const Stack = require("../Stack");
const Utils = require("../Utils");
class Declarator extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isDeclarator= true;
        this.acceptType =  Utils.createStack( compilation, node.acceptType, scope, node ,this);
        this.assignValue = null;
        this.assignItems = new Set();
        this._kind = "var";
    }

    definition(){
        if( this.parentStack.isFunctionExpression){
            const type = this.type().toString();
            const identifier = this.value();
            const context = this;
            return {
                kind:'parameter',
                comments:this.comments,
                identifier:identifier,
                expre:`(parameter) ${identifier}:${type}`,
                location:this.getLocation(),
                file:this.compilation.module.file,
                context
            };
        }else if( this.parentStack.isArrayPattern ){
            const identifier = this.value();
            const desc = this.description();
            const context = desc;
            const expre = desc.isFunctionExpression ? `${this.kind} ${identifier}:()=>${desc.type().toString()}` : `${this.kind} ${identifier}:${this.type().toString()}`;
            return {
                kind:this.kind,
                comments:this.comments,
                identifier:identifier,
                expre:expre,
                location:this.getLocation(),
                file:this.compilation.module.file,
                context
            };
        }
        return null;
    }

    set kind(value){
       this._kind=value;
    }

    get kind(){
        return this._kind;
    }

    reference(){
        return this.assignValue ? this.assignValue.reference() : this;
    }

    referenceItems(){
        if( this.assignItems.size < 1 ){
            return [this];
        }
        let items = [];
        this.assignItems.forEach( item=>{
            items=items.concat( item.referenceItems() );
        });
        return items;
    }

    description(){
        return this.assignValue ? this.assignValue.description() : this;
    }

    type(){
        const description = this.acceptType || this.assignValue;
        if( description && description.isFunctionExpression ){
            return this.compilation.getType("Function");
        }
        return description ? description.type() : this.compilation.getType("any");
    }

    check(){
        const type = this.type();
        if( type.id ==="void" ){
            this.throwError("Void cannot be used to declare a type")
        }else if(type instanceof Stack){
            type.check();
        }
    }

    assignment( value, stack=null ){
        const assignType = !this.assignValue ? null : (Utils.isFunction( this.assignValue ) ? this.compilation.getType("Function") : this.assignValue.type());
        const acceptType = this.acceptType ? this.acceptType.type() : assignType;
        if( acceptType ){
            if( Utils.isFunction(value) ){
                if( !acceptType.is( this.compilation.getType("Function") ) ){
                    (stack||this).throwError(`"${this.raw()}" of type "${acceptType.toString()}" is not assignable to assignment of type "Function"`);
                }
            }else if( !acceptType.check( value ) ){
                (stack||this).throwError(`"${this.raw()}" of type "${acceptType.toString()}" is not assignable to assignment of type "${value.type().toString()}"`);
            }
        }
        this.assignItems.add( value );
        this.assignValue = value;
    }
}

module.exports = Declarator;