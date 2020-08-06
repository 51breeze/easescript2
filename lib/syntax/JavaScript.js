const Grammar = require("../Grammar");
class JavaScript extends Grammar {

    isRuntime( type )
    {
        return type === "client";
    }

    getIndent(scope)
    {
       const level = scope.level-1;
       return "\t".repeat( level );
    }

    semicolon(scope,expre,isBlock)
    {
        if( !expre )return "";

        expre = this.getIndent(scope)+expre;
        if( isBlock )
        {
            return expre ? expre+"\r\n" : "";
        }
        return expre ? expre+";\r\n" : "";
    }

    makeIfStatement(scope,condition,consequent,alternate)
    {
        const indent = this.getIndent(scope);
        alternate = alternate ? `${indent}else{\r\n${alternate}}` : "";
        return `if(${condition}){\r\n${consequent}${indent}}${alternate}`;
    }

    makeSwitchStatement(scope,condition,consequent)
    {
        const indent = this.getIndent(scope);
        return `switch( ${condition} ){\r\n ${consequent}${indent}}`;
    }

    makeSwitchCaseStatement(scope,condition,consequent)
    {
        const indent = this.getIndent(scope);
        if( condition==null )
        {
            return `${indent}default :\r\n ${consequent}`;
        }
        return `${indent}case ${condition} :\r\n ${consequent}`;
    }

    makeWhileStatement(scope,condition,consequent)
    {
        const indent = this.getIndent(scope);
        return `while( ${condition} ){\r\n${consequent}${indent}}`;
    }

    makeBreakStatement( scope )
    {
       return `break`;
    }

    makeDoWhileStatement(scope,condition,consequent)
    {
        const indent = this.getIndent(scope);
        return `do{\r\n${consequent}${indent}}while(${condition} )`;
    }

    makeForStatement(scope,init,test,update,body)
    {
        const indent = this.getIndent(scope);
       return `for(${init};${test};${update}){\r\n${body}${indent}}`;
    }

    makeForInStatement(scope,init,right,body)
    {
        const indent = this.getIndent(scope);
        return `for(${init} in ${right}){\r\n${body}${indent}}`;
    }

    makeForOfStatement(scope,init,right,body)
    {
        const indent = this.getIndent(scope);
        return `for(${init} of ${right}){\r\n${body}${indent}}`;
    }

    makeTryStatement(scope,tryBody,handler,paramName,paramType)
    {
        const indent = this.getIndent(scope);
        return `try{\r\n${tryBody}${indent}}catch(${paramName}){\r\n${handler}${indent}}`;
    }

    makeDeclarationVariable(kind,assign)
    {
        return `${kind} ${assign}`;
    }

    makeEnumDeclaration(inherit, expression)
    {
        return inherit ? `Object.assign(Object.assign({},${inherit}),${expression})` : expression;
    }

    makeAssign(name,assign,defaultValue,type)
    {
        assign = defaultValue ? `${assign} || ${defaultValue}` : assign;
        return assign ? `${name}=${assign}` : `${name}`;
    }

    makeObjectExpression(scope,properties)
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

    makeCallExpression(target, args )
    {
        return `${target}(${args.join(",")})`;
    }

    makeThisExpression( scope )
    {
        if( scope )
        {
            let fnScope = scope.getScopeByType("function")
            if( fnScope.isArrow )
            {
                fnScope = fnScope.parent.getScopeByType("function")
                return fnScope.getThisRef();
            }
        }
        return `this`;
    }

    makeFunctionExpression(scope,expres,name,params,returnType)
    {
        const defaultValues=[];
        params = Object.values(params).map( (item)=>{
           if( item.defaultValue )
           {
               const expre = this.makeAssign( item.name, `${item.name} === void 0 ? ${item.defaultValue} : ${item.name}`,null,item.type);
               defaultValues.push( "\t"+this.semicolon(scope,expre) );
           }
           return item.name;
        });
        const indent = this.getIndent(scope);
        return `function ${name||""}(${params.join(",")}){\r\n${defaultValues.join("")}${expres}${indent}}`;
    }

    makeUpdateExpression(target,operator,prefix)
    {
        if( prefix )
        {
            return `${operator}${target}`;
        }
        return `${target}${operator}`;
    }

}
module.exports = JavaScript;