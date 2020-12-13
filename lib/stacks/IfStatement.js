const Stack = require("../Stack");
const Utils = require("../Utils");
class IfStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.condition = Utils.createStack(compilation,node.test,scope,node,this);
        this.consequent  = Utils.createStack(compilation,node.consequent,scope,node,this);
        this.alternate  = Utils.createStack(compilation,node.alternate,scope,node,this);
    }

    parser(syntax){
        if( !this.condition ){
            this.throwError("Missing condition");
        }
        this.condition.parser(syntax);
        this.consequent.parser(syntax);
        if( this.alternate ){
            this.alternate.parser(syntax);
        }
    }

    emit(syntax){
        const condition = this.condition.emit(syntax);
        const consequent = this.consequent.emit(syntax);
        const alternate = this.alternate && this.alternate.emit(syntax);
        if( alternate ){
            alternate = `else{${alternate}}`;
        }
        return `if(${condition}){${consequent}}${alternate}`;
    }
}

module.exports = IfStatement;