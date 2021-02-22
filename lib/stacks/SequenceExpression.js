const Utils = require("../Utils");
const Expression = require("./Expression");
class SequenceExpression extends Expression{
     constructor(compilation,node,scope,parentNode,parentStack){
          super(compilation,node,scope,parentNode,parentStack);
          this.isSequenceExpression= true;
          this.expressions = node.expressions.map( item=>Utils.createStack( compilation, item, scope, node, this ) );
     }
     parser(syntax){
          this.expressions.forEach( item=>item.parser(syntax) );
     }
}

module.exports = SequenceExpression;