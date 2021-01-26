const Syntax = require("./Syntax");
class Program extends Syntax{
   emit(syntax){
       return this.stack.body.map(item =>{
            return item.emit(syntax);
       }).join("\n");
   }
}

module.exports = Program;