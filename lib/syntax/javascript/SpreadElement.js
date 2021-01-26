const Syntax = require("./Syntax");
class SpreadElement extends Syntax{
    emit(syntax){
        return this.stack.argument.emit(syntax);
    }
}

module.exports = SpreadElement;