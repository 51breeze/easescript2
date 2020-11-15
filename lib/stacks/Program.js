const Stack = require("../Stack.js");
const Utils = require("../Utils.js");
class Program extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.body = node.body.map( item=>{
            return Utils.createStack(compilation, item, scope, node, this);
        });
    }

   parser()
   {
      this.body.forEach(item =>{
          item.parser();
      });
   }

   raw()
   {
       return this.compilation.module.source;
   }

   emit()
   {
       this.parser();
       return this.body.map(item =>{
            return item.emit();
       });
   }
}

module.exports = Program;