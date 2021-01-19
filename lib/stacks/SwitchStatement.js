const Stack = require("../Stack");
const Utils = require("../Utils");
class SwitchStatement  extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.condition = Utils.createStack( compilation, node.discriminant, scope, node,this );
        this.cases = node.cases.map( item=>{
           return Utils.createStack( compilation, item, scope, node,this );
        });
        if( this.hasAwait ){
            const stack = this.getParentStackByName("FunctionExpression");
            this.awaitLabelIndex= ++stack.awaitCount;
        }
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
        const condition = this.condition.emit(syntax);
        const cases = this.cases.map( item=>item.emit(syntax) ).join("\n");
        if( this.hasAwait ){
            return `switch(${condition}){${cases}}\r\n${this.insertBefore.join("\r\n")}\r\ncase ${this.awaitLabelIndex}:`;
        }
        return `switch(${condition}){${cases}}\r\n${this.insertBefore.join("\r\n")}`;
   }
}

module.exports = SwitchStatement;