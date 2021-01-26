const Syntax = require("./Syntax");
class VariableDeclarator extends Syntax {
    emit(syntax){
        if( this.stack.isPattern ){
            return this.stack.id.emit( syntax );
        }else{
            const init = this.stack.init && this.stack.init.emit(syntax);
            const name = this.stack.id.emit(syntax);
            if( init ){
                return `${name} = ${init}`;
            }
            return name;
        }
    }
}

module.exports = VariableDeclarator;