const events = require('events');
class Grammar extends events.EventEmitter 
{
    constructor(stack){ 
        super();
        this.stack = stack;
        this.scope = stack.scope;
        this.compilation = stack.compilation;
        this.parentStack = stack.parentStack;
        this.parentNode = stack.parentNode;
    }

    getIndent(){
        const level = this.scope.level-1;
        return "\t".repeat( level );
    }

    semicolon(expression){
        if( !expression )return "";
        return `${this.getIndent()}${expression};\r\n`;
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

    dispatcher(event, ...args){
        return super.emit(event, ...args);
    }
}


module.exports = Grammar;
