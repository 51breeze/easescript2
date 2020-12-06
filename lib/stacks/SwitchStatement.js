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
   }

   parser(syntax)
   {
       this.cases.forEach( item=>item.parser(syntax) );
   }

   emit(syntax)
   {
        const condition = this.condition.emit(syntax);
        const cases = this.cases.map( item=>item.emit(syntax) ).join("\n");
        return `switch(${condition}){${cases}}`;
   }
}

module.exports = SwitchStatement;