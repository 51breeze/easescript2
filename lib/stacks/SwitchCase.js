const Stack = require("../Stack");
const Utils = require("../Utils");
class SwitchCase  extends Stack {

   constructor(compilation,node,scope,parentNode,parentStack)
   { 
        super(compilation,node,scope,parentNode,parentStack);
        this.condition = Utils.createStack( compilation, node.test, scope, node,this );
        this.consequent = node.consequent.map( item=>Utils.createStack( compilation, item, scope, node,this ) );
   }

   parser(syntax){
      this.consequent.forEach( item=>item.parser(syntax) );
   }
   
   emit(syntax){
       const condition = this.condition && this.condition.emit(syntax);
       const consequent = this.consequent.map( item=>item.emit(syntax) ).join("\n");
       if( condition )
       {
            return `case ${condition} :\n ${consequent}`;
       }
       return `default:\n ${consequent}`;
   }
}

module.exports = SwitchCase;