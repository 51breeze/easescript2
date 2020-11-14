const Stack = require("../Stack.js");
const Utils = require("../Utils.js");
class Program extends Stack{

    constructor(module,node,scope,parentNode)
    {
        super(module,node,scope,parentNode);
        this.body = node.body.map( item=>{
            return Utils.createStack( module, item, scope, node );
        });
    }

   parser()
   {
      return this.body.forEach(item =>{
          item.parser();
      });
   }

   raw()
   {
       return this.node.name;
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