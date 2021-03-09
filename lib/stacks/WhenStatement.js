const Stack = require("../Stack");
const Utils = require("../Utils");
class WhenStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isWhenStatement= true;
        this.condition = Utils.createStack(compilation,node.test,scope,node,this);
        this.consequent = Utils.createStack(compilation,node.consequent,scope,node,this);
        this.alternate = Utils.createStack(compilation,node.alternate,scope,node,this);
    }

    parser(grammar){
        this.consequent.parser(grammar);
        this.alternate.parser(grammar);
    }
}

module.exports = WhenStatement;