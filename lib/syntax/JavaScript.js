//const Grammar = require("../Builder");
const Scope = require("../Scope");
class JavaScript {

    getIndent(scope){
        const level = scope.level-1;
        return "\t".repeat( level );
    }

    semicolon(scope,expre){
        if( !expre )return "";
        return this.getIndent(scope)+expre+";\r\n";
    }

    isRuntime( name ){
        return name === "client";
    }

    isSyntax( name ){
        return name.toLowerCase() === "javascript";
    }

    makeReturnStatement(scope,expre){
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
        return `[${elements.join(",")}]`;
    }

    makeSpreadArrayExpression(scope,elements,hasSpread)
    {
        const first = elements.shift();
        if( elements.length>0){
            return `${first}.concat(${elements.join(",")})`;
        }
        return `[].concat(${first})`;
    }

    makeObjectExpression(scope,properties)
    {
        return `{${properties.join(",")}}`;
    }

    makeSpreadElement(scope,expres)
    {
        let base = expres.shift();
        let elem = null;
        while( elem = expres.shift() )
        {
            base = `Object.assign(${base},${elem})`;
        }
        return base;
    }

    makeObjectMerge(scope,props)
    {
        let object = props.shift();
        while( props.length > 0 )
        {
            let prop = props.shift();
            object = `Object.assign(${object},${prop})`;
        }
        return object;
    }

    makeObjectKeyValue(key,value)
    {
        return `"${key}":${value}`;
    }

    makeObjectPropertyValue(target,key)
    {
        return `${target}.${key}`;
    }

    makeArrayPropertyValue(target,key)
    {
        return `${target}[${key}]`;
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
        return `this`;
    }

    makeFunctionParamSupportDefaultValue(){
        return false;
    }

    makeFunctionParamSupportRest(){
        return false;
    }

    makeFunctionExpression(scope,body,name,params,returnType)
    {
        const indent = this.getIndent(scope);
        return `function ${name||""}(${params.join(",")}){\r\n${body}${indent}}`;
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
        return `${name}=${value}`;
    }

    makeVariableDeclarator(scope,name,value)
    {
        if( value ){
           return `${name}=${value}`;
        }
        return name;
    }

    makeComputeValue(value,defaultValue)
    {
        if( !defaultValue )
        {
            return value;
        }
        return `${value} || ${defaultValue}`;
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