const Grammar = require("../Grammar");
const { prototype } = require("../Stack");
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

    makeReturnStatement(scope,expre)
    {
        const indent = this.getIndent(scope);
        if( expre ){
            return `${indent}return ${expre}`;
        }
        return `${indent}return`;
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

    makeDeclarationVariable(scope,kind,declarations,isFor)
    {
        return `${kind} ${declarations.join(",")}`;
    }

    makeEnumDeclaration(inherit, expression)
    {
        return inherit ? `Object.assign(Object.assign({},${inherit}),${expression})` : expression;
    }

    makeAssign(name,assign,defaultValue,type)
    {
        assign = this.makeComputeValue(assign,defaultValue);
        return assign ? `${name}=${assign}` : `${name}`;
    }
    
    makeRestElement(scope,name)
    {
        const expre = this.makeDeclarationVariable(scope,"const", [this.makeAssign(name,"arguments")] );
        scope.pushBefore( this.semicolon(scope,expre) );
        return null;
    }

    makeSpreadElement(scope,name)
    {
        return name;
    }

    makeArrayExpression(scope,elements,hasSpread)
    {
        if( hasSpread )
        {
            elements = elements.map((val)=>{
                return val instanceof Array ? val.join(",") : val;
            })
            return `[].concat(${elements.join(",")})`;
        }
        return `[${elements.join(",")}]`;
    }

    makeObjectExpression(scope,properties,hasSpread)
    {
        if( hasSpread )
        {
            const items = [];
            const pos   = [];
            let last = 0;
            properties.forEach( (item,index)=>{
                if( item instanceof Array ){
                    pos.push( index+1 - last );
                    last = index+1;
                }
            });
            pos.push( properties.length );

            let len = 0;
            pos.forEach( index=>{
                const props = properties.splice(0,index-len );
                len+=props.length;
                if( props[0] instanceof Array )
                {
                    items.push( props[0].join(",") );
                }else
                {
                    items.push( `{${props.join(",")}}` );
                }
            });

            let expres = "{}";
            items.forEach( obj=>{
                expres = `Object.assign(${expres},${obj})`;
            });

            return expres;

        }
        return `{${properties.join(",")}}`;
    }

    makeObjectKeyValue(key,value)
    {
        return `"${key}":${value}`;
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
           if( item.value )
           {
               const expre = this.makeAssign( item.name, `${item.name} === void 0 ? ${item.value} : ${item.name}`,null,item.type);
               defaultValues.push( "\t"+this.semicolon(scope,expre) );
           }
           return item.name;
        });
        const indent = this.getIndent(scope);
        return `function ${name||""}(${params.join(",")}){\r\n${defaultValues.join("")}${expres}${indent}}`;
    }

    makeLogicalExpression(left,right,operator)
    {
        return `${left} ${operator||"||"} ${right}`;
    }

    makeBinaryExpression(left,right,operator)
    {
        return `${left} ${operator} ${right}`;
    }

    makeNewExpression(scope,callee,args)
    {
        return `new ${callee}(${args.join(",")})`;
    }

    makeAssignmentExpression(scope,name,value)
    {
        if( !value )
        {
            return name;
        }
        return `${name}=${value}`;
    }

    makeComputeValue(value,defaultValue)
    {
        if( defaultValue && value === void 0)
        {
            return defaultValue;
        }
        return defaultValue ? `${value} || ${defaultValue}` : value;
    }

    makeUpdateExpression(target,operator,prefix)
    {
        if( prefix )
        {
            return `${operator}${target}`;
        }
        return `${target}${operator}`;
    }
    
    makeUnaryExpression(target,operator,prefix)
    {
        if( prefix )
        {
            return `${operator}${target}`;
        }
        return `${target}${operator}`;
    }

}
module.exports = JavaScript;