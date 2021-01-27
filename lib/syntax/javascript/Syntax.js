const Grammar = require("../../Grammar");
class Syntax extends Grammar {
    
    isRuntime( name ){
        return name.toLowerCase() === "client";
    }

    isSyntax( name ){
        return name.toLowerCase() === "javascript";
    }
}

module.exports = Syntax;