const Stack = require("../Stack");
const Utils = require("../Utils");
class Identifier extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        if( this.scope.type("blank") ){
            this.statementType = Utils.createStack(compilation,node.acceptType,scope,node,this);   
        }
    }

    description(){
        const value = this.node.name;
        if( this.scope.type("blank") && this.statementType){
             return this.statementType;
        }
        const description = this.scope.define( value ) || this.compilation.getType( value );
        if( !description ){
            this.compilation.throwErrorLine(`"{code}" is not defined`, this.node );
        }
        return description;
    }

    parser(syntax)
    {
        this.description();
    }

    type(){
        const desc = this.description();
        return desc instanceof Stack ? desc.type() : desc;
    }

    value(){
        return this.node.name;
    }

    raw(){
        return this.node.name;
    }

    emit(syntax){
        return this.node.name;
    }
}

module.exports = Identifier;