const Syntax = require("./Syntax");
class ObjectPattern extends Syntax {
    emit(syntax){
        return this.stack.properties.map( item=> {
            return item.emit(syntax);
        });
    }
}

module.exports = ObjectPattern;