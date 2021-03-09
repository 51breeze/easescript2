const Stack = require("../Stack.js");
const Utils = require("../Utils.js");
class Program extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.isProgram= true;
        this.body = node.body.map( item=>{
            return Utils.createStack(compilation, item, scope, node, this);
        });
    }

    parser(grammar){
        this.body.forEach(item =>{
            item.parser(grammar);
        });
    }

    raw(){
        return this.compilation.module.source;
    }
}

module.exports = Program;