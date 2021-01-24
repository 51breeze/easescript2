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

   emit(syntax) {
        const stack = this.hasAwait ? this.getParentStackByName("FunctionExpression") : null;
        this.awaitNextLabelIndex = stack ? this.awaitChildrenNum+stack.awaitCount+2 : 0;
        const condition = this.condition.emit(syntax);
        const cases = this.cases.map( item=>item.emit(syntax) ).join("\n");
        if( stack ){
            const labelIndex = ++stack.awaitCount;
            return `switch(${condition}){${cases}}\r\n${this.insertBefore.join("\r\n")}\r\ncase ${labelIndex}:`;
        }
        return `switch(${condition}){${cases}}\r\n${this.insertBefore.join("\r\n")}`;
   }
}

module.exports = SwitchStatement;