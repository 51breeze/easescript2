const Syntax = require("./Syntax");
class ForStatement extends Syntax{
    emit(syntax){
        const init = this.init.emit(syntax);
        const condition = this.condition.emit(syntax);
        const update = this.update.emit(syntax);
        const body = this.body ? this.body.emit(syntax) : null;
        if( !body ){
            return this.semicolon(`for(${init};${condition};${update})`);
        }
        return `for(${init};${condition};${update}){${body}}`;
    }
}

module.exports = ForStatement;