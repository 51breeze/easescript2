const MethodDefinition = require("./MethodDefinition");
const Utils = require("../Utils");
class MethodSetterDefinition extends MethodDefinition{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isMethodSetterDefinition= true;
        this.callable = false;
        this.assignValue = null;
        this.assignItems= new Set();
        this.isAccessor = true;
    }
    definition(){
        const identifier = this.key.value();
        const context = this;
        const params  = this.params.map( item=>`${item.raw()}:${item.type().toString()}`);
        const modifier = this.modifier ? this.modifier.value() : "public";
        const owner = this.compilation.module.id;
        const _static = this.static ? 'static ' : '';
        return {
            kind:"setter",
            comments:context.comments,
            identifier:identifier,
            expre:`(propery) ${_static}${modifier} set ${owner}.${identifier}(${params.join(",")}):void`,
            location:this.key.getLocation(),
            file:this.compilation.module.file,
            context
        };
    }
    check(){
        super.check();
        if( this.expression.params.length != 1 ){
            this.throwError(`"${this.key.value()}" setter must have one param`);
        }
        const param = this.expression.params[0];
        const type = param.acceptType ? param.acceptType.type() : this.compilation.getType("any");
        const desc = this.compilation.getReference(this.key.value(), this.compilation.module, !!this.static , "get");
        const returnType = desc.type()
        if( returnType !== type ){
            this.throwError(`"${this.key.raw()}" setter and getter parameter types do not match`);
        }
    }

    type(){
        return this.compilation.getType("void");
    }

    referenceItems(){
        let items = [];
        this.assignItems.forEach( item=>{
            items=items.concat( item.referenceItems() );
        });
        return items;
    }

    assignment( value, stack=null ){
        const param = this.expression.params[0];
        let acceptType = param.acceptType ? param.acceptType.type() : null;
        if( !acceptType ){
           const desc = this.compilation.getReference(this.key.value(), this.compilation.module, !!this.static , "get");
           acceptType = desc ? desc.type() : null;
        }
        const assignType = ()=>{
            if( this.assignValue ){
                if( Utils.isFunction( this.assignValue ) ){
                    return this.compilation.getType("Function");
                }
                return this.assignValue.type();
            }
            return null;
        }
        acceptType = acceptType || assignType();
        if( acceptType ){
            if( Utils.isFunction(value) ){
                if( !acceptType.is( this.compilation.getType("Function") ) ){
                    (stack||this.key).throwError(`"${this.key.raw()}" of type "${acceptType.toString()}" is not assignable to assignment of type "Function"`);
                }
            }
            if( !acceptType.check( value ) ){
                (stack||this.key).throwError(`"${this.key.raw()}" not match of type ${acceptType.toString()} to assignment type ${value.type().toString()}.`);
            }
        }
        this.assignItems.add( value );
        this.assignValue = value;
    }
}

module.exports = MethodSetterDefinition;