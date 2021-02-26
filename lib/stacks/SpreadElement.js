const Stack = require("../Stack");
const Utils = require("../Utils");
class SpreadElement  extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.isSpreadElement=true;
        this.argument = Utils.createStack( compilation, node.argument, scope, node,this );
    }
    description(){
        return this.argument.description();
    }
    reference(){
        return this.argument.reference();
    }
    referenceItems(){
        return this.argument.referenceItems();
    }
    key(){
        return this.argument.key();
    }
    type(){
        return this.argument.type();
    }
    parser(syntax){
        this.argument.parser(syntax);
    }
    value(){
        return this.argument.value();
    }
    raw(){
        return this.argument.raw();
    }
    throwError( message ){
        this.argument.throwError(message);
    }
    throwWarn( message ){
        this.argument.throwError(message);
    }
}

module.exports = SpreadElement;