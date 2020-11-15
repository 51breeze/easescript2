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

   get description()
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

   set assignment( value )
   {
        this.assignValue = value;
   }

   parser(){ 
   }

   raw(){
       return this.node.name;
   }

   emit(){
       const id   = this.id.emit();
       const init = this.init.emit();
       return `${id}=${init}`;
   }
}

module.exports = VariableDeclarator;