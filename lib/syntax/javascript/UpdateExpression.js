const Syntax = require("./Syntax");
class UpdateExpression extends Syntax {
    emit(syntax){
        const argument = this.stack.argument.emit(syntax);
        const operator = this.stack.node.operator;
        const prefix = this.stack.node.prefix;
        if( prefix ){
            return `${operator}${argument}`;
        }
        return `${argument}${operator}`;
    }
}

module.exports = UpdateExpression;