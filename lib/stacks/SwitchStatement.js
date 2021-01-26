const Stack = require("../Stack");
const Utils = require("../Utils");
class SwitchStatement  extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.isSwitchStatement=true;
        this.awaitChildrenNum = 0;
        this.condition = Utils.createStack(compilation, node.discriminant, scope, node,this );
        this.cases = node.cases.map( item=>{
           return Utils.createStack( compilation, item, scope, node,this );
        });
        this.insertBefore = [];
        this.addListener("insertBefore",(content)=>{
            if( content ){
                this.insertBefore.push(content);
            }
        });
   }

   parser(syntax){
       this.cases.forEach( item=>item.parser(syntax) );
   }
}

module.exports = SwitchStatement;