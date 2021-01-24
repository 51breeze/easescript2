class Base {

    constructor(stack){ 
        this.stack = stack;
    }

    getIndent(){
        const level = this.stack.scope.level-1;
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
}

module.exports = Base;