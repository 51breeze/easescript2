const Syntax = require("./Syntax");
class NewExpression extends Syntax{
    emit(syntax){
        const callee= this.stack.callee.emit(syntax);
        const args= this.stack.arguments.map( item=>item.emit(syntax) ).join(",");
        return `new ${callee}(${args})`;
    }
}

module.exports = NewExpression;