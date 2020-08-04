const Grammar = require("../Grammar");
class JavaScript extends Grammar {

    isRuntime( type )
    {
        return type === "client";
    }

    semicolon( expre, scope){
        return expre ? expre+";\r\n" : ""; 
    }

    makeDeclarationVariable(kind,assign)
    {
        return `${kind} ${assign}`;
    }

    makeAssign(name,assign,defaultValue,type)
    {
        assign = defaultValue ? `${assign} || ${defaultValue}` : assign;
        return assign ? `${name}=${assign}` : `${name}`;
    }

    makeObjectExpression(properties)
    {
        return `{${properties.join(",")}}`;
    }

    makeObjectKeyValue(key,value)
    {
        return `${key}:${value}`;
    }

    makeMemberExpression( member )
    {
        return member.join(".");
    }

    makeCallExpression( target, args )
    {
        return `${target}(${args.join(",")})`;
    }

    makeFunctionExpression(expres,name,params,returnType)
    {
        params = Object.values(params).map( (item)=>{
           return item.name;
        });
        return `function ${name||""}(${params.join(",")}){\r\n${expres}}`;
    }

}
module.exports = JavaScript;