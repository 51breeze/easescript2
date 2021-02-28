const Stack = require("../Stack");
const Utils = require("../Utils");
class Identifier extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isIdentifier= true;
        this.acceptType = Utils.createStack(compilation,node.acceptType,scope,node,this);   
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

    parser(syntax){
       this.check();
    }

    type(){
        if( this.acceptType ){
            return this.acceptType.type();
        }
        const value = this.value();
        const description = this.scope.define( value ) || this.compilation.getType( value );
        if( !description ){
            const scope = this.scope;
            const construct = this.compilation.module.methodConstructor;
            if( scope.define("this") && construct && construct.genericity){
                construct.genericity.find( item=>{
                    console.log( item.value() )
                });
                //this.module.m
            }
        }
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