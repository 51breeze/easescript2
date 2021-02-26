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

    parser(syntax){
        this.key.parser(syntax);
        this.acceptType && this.acceptType.parser(syntax);
        this.init.parser(syntax);
    }

    throwError(message){
        this.key.throwError(message)
    }
    throwWarn(message){
        this.key.throwWarn(message)
    }
}

module.exports = Property;