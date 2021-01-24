const Syntax = require("./Syntax");
class ClassDeclaration extends Syntax{
    emit( syntax ){
        const body = this.stack.body.map( item=>item.emit(syntax) ).filter( item=>!!item );
        return body.join("\r\n");
    }
}

module.exports = ClassDeclaration;