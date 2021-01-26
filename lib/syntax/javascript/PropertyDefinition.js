const Syntax = require("./Syntax");
class PropertyDefinition extends Syntax{
    emit(syntax) {
        const id = this.stack.id;
        const init = this.stack.init ? this.stack.init.emit(syntax) : null;
        return init ? `${id}=${init}` : id;
    }
}

module.exports = PropertyDefinition;