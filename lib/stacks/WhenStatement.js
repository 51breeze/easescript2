const Stack = require("../Stack");
const Utils = require("../Utils");
class WhenStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.condition = Utils.createStack(compilation,node.test,scope,node,this);
        this.consequent = Utils.createStack(compilation,node.consequent,scope,node,this);
        this.alternate = Utils.createStack(compilation,node.alternate,scope,node,this);
    }

    parser(syntax){
        this.consequent.parser(syntax);
        this.alternate.parser(syntax);
    }

    emit(syntax){
        const condition  = this.condition.emit(syntax);
        const consequent = this.consequent.emit(syntax);
        const alternate  = this.alternate.emit(syntax);
        return ``;
    }
}

module.exports = WhenStatement;