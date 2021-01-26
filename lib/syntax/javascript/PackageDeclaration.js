const Syntax = require("./Syntax");
class PackageDeclaration extends Syntax{
   emit(syntax){
        const body = this.stack.body.map(item =>{
            return item.emit(syntax);
        }).filter( item=>!!item ).join("\r\n");
        console.log( body )
        return body;
   }
}

module.exports = PackageDeclaration;