const path   = require("path");
const Namespace   = require("./Namespace.js");
const Type = require("./Type.js");
const AnyType = require("./AnyType.js");
const VoidType = require("./VoidType.js");
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
    "Date":true,
    "Int":true,
    "Uint":true,
    "Float":true,
    "Double":true,
};

const alias = {
    "string":"String",
    "object":"Object",
    "number":"Number",
    "Integer":"Number",
    "boolean":"Boolean",
    "bool":"Boolean",
    "array":"Array",
    "console":"Console",
    "int":"Int",
    "uint":"Uint",
    "double":"Double",
    "float":"Float",
}

Namespace.dataset.set("void", new VoidType("void") );
Namespace.dataset.set("any", new AnyType("any") );
Namespace.dataset.set("NaN", new Type("Number") );
Namespace.dataset.set("Infinity", new Type("Number") );
Namespace.dataset.set("Nullable", new Type("Nullable") );

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