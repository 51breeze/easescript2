const Stack = require("../Stack");
const Utils = require("../Utils");
const BlockScope = require("../scope/BlockScope");
class SwitchStatement  extends Stack {
    constructor(compilation,node,scope,parentNode,parentStack){ 
        super(compilation,node,scope,parentNode,parentStack);
        this.isSwitchStatement=true;
        this.awaitChildrenNum = 0;
        this.condition = Utils.createStack(compilation, node.discriminant, scope, node,this );
        scope = new BlockScope(scope);
        this.cases = node.cases.map( item=>{
           return Utils.createStack( compilation, item, scope, node, this );
        });
    }
    definition(){
        return null;
    }
    parser(grammar){
        this.cases.forEach( item=>item.parser(grammar) );
    }
}

module.exports = SwitchStatement;