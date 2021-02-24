const path   = require("path");
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

const constantSet={
    "NaN":"Number",
    "Infinity":"Number",
    "Nullable":new Type("Nullable"),
    "void":new VoidType("void"),
    "any":new AnyType("any"),
}

class Globals{
    static constant(name){
        return constantSet[name] || null;
    }
    static is( name ){
        name = alias[ name ] || name;
        return map[ name ];
    }
    static alias( name ){
        return alias[ name ] || name;
    }
    static type( name ){
        name = alias[ name ] || name;
        return map[ name ] ? name : null;
    }
    static getFile( name ){
        if( Globals.is( name ) ){
            return path.join("./types", name);
        }
        return name;
    }
}
module.exports = Globals;