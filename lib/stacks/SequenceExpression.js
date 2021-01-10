const Utils = require("../Utils");
const Expression = require("./Expression");
class SequenceExpression extends Expression{

     constructor(compilation,node,scope,parentNode,parentStack){
          super(compilation,node,scope,parentNode,parentStack);
          this.expressions = node.expressions.map( item=>Utils.createStack( compilation, item, scope, node, this ) );
     }
     description(){}
     type(){}
     check(){
          this.expressions.forEach( item=>item.check() );
     }
     parser(syntax){
          this.expressions.forEach( item=>item.parser(syntax) );
     }
     emit(syntax){
         const expressions = this.expressions.map( item=>item.emit(syntax) );
         return expressions.join(",");
     }
}

module.exports = SequenceExpression;