const Syntax = require("./Syntax");
class Declarator  extends Syntax {
    emit(syntax){
        return this.stack.value();
    }
}

module.exports = Declarator;