const Grammar = require("../Grammar");
class JavaScript extends Grammar {

    isRuntime( type )
    {
        return type === "client";
    }

}
module.exports = JavaScript;