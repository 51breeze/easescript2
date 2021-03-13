const Utils = require("../Utils");
const Expression = require("./Expression");
class SequenceExpression extends Expression{
     constructor(compilation,node,scope,parentNode,parentStack){
          super(compilation,node,scope,parentNode,parentStack);
          this.isSequenceExpression= true;
          this.expressions = node.expressions.map( item=>Utils.createStack( compilation, item, scope, node, this ) );
     }
     definition(){
          return null;
     }
     parser(grammar){
          this.expressions.forEach( item=>item.parser(grammar) );
     }
}

module.exports = SequenceExpression;