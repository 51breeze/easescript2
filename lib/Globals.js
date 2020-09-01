const path   = require("path");
const map = {
    "String":true,
    "Object":true,
    "Number":true,
    "Boolean":true,
    "RegExp":true,
    "Array":true,
    "Console":true,
    "Float":true,
    "Map":true,
    "Error":true,
    "Class":true,
    "Iterator":true,
    "Function":true,
    "Any":true,
    "Void":true,
};

const alias = {
    "string":"String",
    "object":"Object",
    "number":"Number",
    "Integer":"Number",
    "int":"Number",
    "uint":"Number",
    "float":"Float",
    "double":"Float",
    "boolean":"Boolean",
    "bool":"Boolean",
    "any":"Any",
    "void":"Void",
    "array":"Array",
    "console":"Console",
}


class Globals
{
    static is( name )
    {
        name = alias[ name ] || name;
        return map[ name ];
    }

    static type( name )
    {
        name = alias[ name ] || name;
        return map[ name ] ? name : null;
    }
    
    static getFile( name )
    {
        if( Globals.is( name ) )
        {
            return path.join("./types", name);
        }
        return name;
    }
}

module.exports = Globals;