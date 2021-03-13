const Stack = require("../Stack");
const Utils = require("../Utils");
class Identifier extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isIdentifier= true;
        this.acceptType = Utils.createStack(compilation,node.acceptType,scope,node,this);   
    }

    definition(){
        if( this.parentStack.isMemberExpression || (this.parentStack.isProperty && this.parentStack.parentStack.isObjectExpression) ){
            return this.parentStack.definition();
        }
        const context = this.description();
        if( context ){
            return context.definition();
        }
        return null;
    }

    reference(){
        const value = this.value();
        const description = this.scope.define( value );
        if(description && description !== this && description instanceof Stack ){
            return description.reference();
        }
        return this;
    }

    referenceItems(){
        const value = this.value();
        const description = this.scope.define( value );
        if(description && description !== this && description instanceof Stack ){
            return description.referenceItems();
        }
        return [this];
    }

    description(){
        if( this.acceptType ){
            return this.acceptType;
        }
        const value = this.value();
        return this.scope.define( value ) || this.compilation.getType( value );
    }

    check(){
        if( !(this.scope.type("blank") || this.parentNode.type==="Property") ){
            const value = this.value();
            const description = this.scope.define( value ) || this.compilation.getType( value );
            if( !description ){
                this.throwError(`"${value}" is not defined`);
            }
        }
    }

    type(){
        if( this.acceptType ){
            return this.acceptType.type();
        }
        const value = this.value();
        const description = this.scope.define( value ) || this.compilation.getType( value );
        return description instanceof Stack ? description.type() : description;
    }

    value(){
        return this.node.name;
    }

    raw(){
        return this.node.name;
    }
}

module.exports = Identifier;