const Stack = require("../Stack");
const Utils = require("../Utils");
class VariableDeclarator extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.id = Utils.createStack( compilation,node.id, scope, node, this);
        this.acceptType = Utils.createStack( compilation,node.acceptType, scope, node,this);
        this.init = Utils.createStack( compilation,node.init, scope, node, this);
        this.kind = parentNode.kind;
        this.assignValue = null;
        scope.define( this.id.value(), this );
   }

   description()
   {
       if( this.acceptType )
       {
           return this.acceptType.description;
       }
       if( this.assignValue )
       {
           return this.assignValue.description;
       }
       return null;
   }

   assignment( value )
   {
        this.assignValue = value;
   }

   parser(syntax){ 
   }

   raw(){
       return this.node.name;
   }

   emit(syntax){
       const id   = this.id.emit(syntax);
       const init = this.init && this.init.emit(syntax);
       if( init ){
            return `${id}=${init}`;
       }
       return `${id}`;
   }
}

module.exports = VariableDeclarator;