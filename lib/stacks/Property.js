const Stack = require("../Stack");
const Utils = require("../Utils");
class Property extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.isProperty= true;
        this.key = Utils.createStack( compilation, node.key,scope, node,this );
        this.init = Utils.createStack( compilation, node.value,scope, node,this );
        this.acceptType = Utils.createStack( compilation, node.acceptType,scope, node,this );
        this.assignValue = this.init;
        this._assignItems = new Set();
        this._kind = node.kind;
        this.hasAssignmentPattern = false;
        if( this.init.isAssignmentPattern ){
            this.hasAssignmentPattern = true;
            this.init.acceptType = this.acceptType;
        }
    }

    set kind( value ){
        if( this.hasAssignmentPattern ){
            this.init.kind = value;
        }else{
            this._kind = value;
        }
    }

    get kind(){
        if( this.hasAssignmentPattern ){
            return this.init.kind;
        }else{
            return this._kind;
        }
    }

    value(){
        return this.key.value();
    }

    reference(){
        if( this.hasAssignmentPattern ){
            return this.init.reference();
        }
        return this.assignValue ? this.assignValue.reference() : null;
    }

    referenceItems(){
        let items = [];
        this.assignItems.forEach( item=>{
            items=items.concat( item.referenceItems() );
        });
        return items;
    }

    get assignItems(){
        if( this.hasAssignmentPattern ){
            return this.init.assignItems;
        }
        return this._assignItems;
    }

    assignment(value){
        if( this.parentStack.isObjectPattern ){
            if( this.hasAssignmentPattern ){
                this.init.assignment(value);
            }else{
                const acceptType = this.acceptType ? this.acceptType.type() : null;
                if( acceptType && !acceptType.check( value ) ){
                    this.throwError(`'${this.value()}' of type ${acceptType.toString()} is not assignable to assignment of type ${value.type().toString()}`);
                }else if( this.assignValue && !this.assignValue.type().check( value ) ){
                    this.throwError(`'${this.value()}' of type ${acceptType.toString()} is not assignable to assignment of type ${value.type().toString()}`);
                }
                this.assignValue = value;
                this._assignItems.add( value );
            }
        }else{
            this.assignValue = value;
            this._assignItems.add( value );
        }
    }

    type(){
        if( this.acceptType ){
            return this.acceptType.type();
        }
        if( this.parentStack.isObjectPattern && !this.hasAssignmentPattern ){
            return this.compilation.getType("any");
        }
        return this.assignValue.type();
    }

    description(){
        return this.assignValue.description();
    }

    check(grammar){
        if( !this.parentStack.isObjectPattern )return;
        const target = this.parentStack.parentStack.init;
        const name  = this.value();
        const desc  = this.scope.define( name );
        if( !desc ){
            this.throwError(`"${name}" is not defined.`);
        }
        this.acceptType && this.acceptType.check(grammar);
        if( target.isObjectExpression || target.isArrayExpression ){
            const init = target.attribute( name );
            if( !init ){
                this.throwError(`"${name}" is not defined.`);
            }
            desc.assignment( init );
        }else{
            if(target.isIdentifier){
                const type = target.type(); 
                if( !type.is( this.compilation.getType("Object") ) ){
                    target.throwError(`"${target.raw()}" reference to the spread expression must be an object.`);
                }
            }else{
                if( target.isMemberExpression ){
                    const desc = target.description(grammar);
                    if( desc.isMethod){
                        if( desc.isAccessor && !desc.isMethodGetterDefinition){
                            target.throwError(`"${target.raw()}" reference is accessor but is not getter.`);
                        }
                    }
                }
                if( !target.type().is( this.compilation.getType("Object") ) ){
                    target.throwError(`"${target.raw()}" reference to the spread expression must be an object.`);
                }
            }
            const refer = target.reference();
            if( refer && (refer.isObjectExpression || refer.isArrayExpression) ){
                const propertyValue = refer.attribute( name );
                if( !propertyValue ){
                    if( !this.init.isAssignmentPattern ){
                        this.throwWarn(`"${name}" is not exists. in the "${target.raw()}" reference expression`);
                    }
                }else{ 
                    desc.assignment( propertyValue );
                }
            }
        }
    }

    parser(grammar){
        this.check(grammar);
        this.key.parser(grammar);
        this.acceptType && this.acceptType.parser(grammar);
        this.init && this.init.parser(grammar);
    }

    throwError(message){
        this.key.throwError(message)
    }
    throwWarn(message){
        this.key.throwWarn(message)
    }
}

module.exports = Property;