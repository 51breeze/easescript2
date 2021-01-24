const Grammar = require("../../Grammar");
class Syntax extends Grammar {

    getIndent(){
        const level = this.scope.level-1;
        return "\t".repeat( level );
    }

    semicolon(expression){
        if( !expression )return "";
        return `${this.getIndent()}${expression};`;
    }

    isRuntime( name ){
        return name.toLowerCase() === "client";
    }

    isSyntax( name ){
        return name.toLowerCase() === "javascript";
    }

    throwError(message){
        this.stack.throwError(message);
    }

    throwWarn(message){
        this.stack.throwWarn(message);
    }
}

module.exports = Syntax;