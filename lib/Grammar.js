const BlockScope = require("./scope/BlockScope.js");
const ClassScope = require("./scope/ClassScope.js");
const FunctionScope = require("./scope/FunctionScope.js");
const PropertyDescription = require("./PropertyDescription.js");
const MethodDescription = require("./MethodDescription.js");
const Parameter = require("./Parameter.js");
const Declarator = require("./Declarator.js");
const Namespace  = require("./Namespace.js");
const Type  = require("./Type.js");
const Enum  = require("./Enum.js");
const Union  = require("./Union.js");
const Module = require("./Module.js");
const Scope = require("./Scope.js");

class Grammar {

    constructor(compilation)
    {
       this.compilation = compilation;
       this.module = compilation.module;
    }

    error(message, node)
    {
        this.compilation.throwError(message, node.start );
    }

    getIndent(scope)
    {
        const level = scope.level-1;
        return "\t".repeat( level );
    }

    semicolon(scope,expre)
    {
        if( !expre )return "";
        return this.getIndent(scope)+expre+";\r\n";
    }

    MemberExpression(node)
    {
        const expre = node.member.map( item=>item.name );
        return expre.join(".");
    }

    ObjectExpression(node, scope, parent)
    {
        const properties = [];
        const expres = [];
        let isSpread = false;
        node.properties.forEach( item=>{

            const value = this.build( item.value );
            if( item.isSpreadElement )
            {
                isSpread = true;
                expres.push( this.makeObjectExpression(node.scope, properties.splice(0,properties.length) ) );
                expres.push( value );
            }else{
                properties.push( this.makeObjectKeyValue(item.key,value) );
            }
            
        });

        if( isSpread ){
            return this.makeSpreadElement(node.scope,expres);
        }else{
            return this.makeObjectExpression(node.scope, properties);
        }
    }

    ArrowFunctionExpression(node,scope,parent)
    {
        return this.FunctionExpression(node);
    }

    FunctionExpression(node){

        const body = this.build( node.body );
        const defaultValues=[];
        const args = node.params.map( (item,index)=>{
           if( item.isRest )
           {
              defaultValues.push( this.semicolon(node.scope,`${item.key}=arguments.slice(${index})`) );
           }
           if( item.initValue )
           {
               const value = this.build( item.initValue );
               let expre = `${item.key} = ${item.key} === void 0 ? ${value} : ${item.key}`;
               if( item.isRest ){
                   expre = `${item.key} = ${item.key}.length === 0 ? [].concat(${value}) : ${item.key}`;
               }
               defaultValues.push( this.semicolon(node.scope,expre) );
           }
           return item.key;
        });
        const expression = defaultValues.concat( body ).join("");
        const indent     = this.getIndent(node.scope.parent.getScopeByType("function"));
        return `function(${args.join(",")}){\r\n${expression}${indent}}`;
    }

    ArrayExpression(node)
    {
        const elements =  node.elements.map( item=>this.build(item) );
        return `[${elements.join(",")}]`;
    }

    LogicalExpression(node,scope, parent)
    {
        const left = this.build( node.left );
        const right = this.build( node.right );
        const operator = node.operator;
        return `${left} ${operator} ${right}`;
    }

    AssignmentExpression(node, scope, parent)
    {
        const left = this.build(node.left);
        const right = this.build(node.right);
        return `${left}=${right}`;
    }

    ThisExpression(node)
    {
        return "this";
    }

    BinaryExpression(node)
    {
        const left = this.build(node.left);
        const right = this.build(node.right);
        const operator = node.operator;
        return `${left} ${operator} ${right}`; 
    }

    CallExpression(node)
    {
        const member = node.callee.member.map( item=>item.name );
        const args   = node.arguments.map( item=>this.build(item) );
        const expre  = `${member.join(".")}(${args.join(",")})`;
        return expre;
    }

    NewExpression(node)
    {
        const member = node.callee.member ? node.callee.member.map( item=>item.name ) : [node.callee.value];
        const args   = node.arguments.map( item=>this.build(item) );
        const expre  = `new ${member.join(".")}(${args.join(",")})`;
        return expre;
    }

    RestElement(node)
    {
      
    }

    SpreadElement(node)
    {
       
    }

    ReturnStatement(node)
    {
        const expre = this.build( node.argument );
        return this.semicolon(node.scope,`return ${expre}`);
    }

    ExpressionStatement(node)
    {
        const expres = this.build(node.expression);
        return this.semicolon(node.scope,expres);
    }

    UpdateExpression(node)
    { 
        const argument = this.build(node.argument);
        const operator = node.operator;
        const prefix = node.prefix;
        if( prefix ){
            return `${operator}${argument}`;
        }
        return `${argument}${operator}`;
    }

    UnaryExpression(node)
    {

        console.log( node );

        process.exit();
       
    }

    BlockStatement(node)
    {
       const body = node.body.map( item=>this.build(item) );
       return body.join("");
    }

    IfStatement(node)
    {
         const condition  = this.build(node.condition);
         const consequent = this.build(node.consequent);
         const alternate  = node.alternate ? this.build(node.alternate) : null;
         const indent = this.getIndent(node.scope);
         if( alternate )
         {
            return `${indent}if(${condition}){\r\n${consequent}${indent}}else{\r\n${alternate}${indent}}\r\n`;
         }
         return `${indent}if(${condition}){\r\n${consequent}${indent}}\r\n`;
    }

    WhileStatement(node)
    {
        const condition  = this.build(node.condition);
        const body = this.build(node.body);
        const indent = this.getIndent(node.scope);
        return `${indent}while(${condition}){\r\n${body}${indent}}\r\n`;
    }

    DoWhileStatement(node)
    {
        const condition  = this.build(node.condition);
        const body = this.build(node.body);
        const indent = this.getIndent(node.scope);
        return this.semicolon(node.scope,`do{\r\n${body}${indent}}while(${condition}))`);
    }

    SwitchStatement(node)
    {
        const condition  = this.build(node.condition);
        const cases = node.cases.map( item=>this.build(item) );
        const indent = this.getIndent(node.scope);
        return `${indent}switch(${condition}){\r\n${cases.join("")}${indent}}\r\n`;
    }

    SwitchCase(node)
    {
       const condition = this.build( node.condition );
       const body      = node.body.map( item=>this.build( item ) );
       const indent = this.getIndent(node.scope);
       if( condition ){
           return `${indent}case ${condition} :\r\n${body}`;
       }
       return `${indent}default :\r\n${body}`;
    }

    BreakStatement(node)
    {
        return this.semicolon(node.scope,"break");
    }

    ForStatement(node)
    {
        const init = this.build( node.init );
        const condition = this.build( node.condition );
        const update    = this.build(node.update );
        const body    = this.build(node.body );
        const indent = this.getIndent(node.scope);
        return `${indent}for(${init};${condition};${update}){\r\n${body}${indent}}\r\n`;
    }

    ForInStatement(node)
    {
        const left = this.build( node.left );
        const right = this.build( node.right );
        const body  = this.build( node.body );
        const indent = this.getIndent(node.scope);
        return `${indent}for(${left} in ${right}){\r\n${body}${indent}}\r\n`;
    }

    ForOfStatement(node)
    {
        const left = this.build( node.left );
        const right= this.build( node.right );
        const body = this.build( node.body );
        const indent = this.getIndent(node.scope);
        return `${indent}for( ${left} of ${right} ){\r\n${body}${indent}}\r\n`;
    }

    TryStatement(node)
    {
        const handler = this.build( node.handler.body );
        const body    = this.build( node.body );
        const name    = node.handler.name;
        const indent  = this.getIndent(node.scope);
        return `${indent}try{\r\n${body}\r\n${indent}}catch(${name}){\r\n${handler}${indent}}\r\n`;
    }

    WhenStatement(node)
    {
        const body = node.body.map( item=>this.build(item) );
        return body.join("");
    }

    VariableDeclaration(node)
    {
        const declarations = node.declarations.map( item=>{
            return this.VariableDeclarator( item );
        });
        if( node.flag )
        {
            return `${node.kind} ${declarations.join(",")}`;
        }
        const expres = `${node.kind} ${declarations.join(",")}`;
        return this.semicolon(node.scope, expres);
    }

    VariableDeclarator(node)
    {
        const key =  node.key;
        const initValue = this.build( node.initValue );
        const defaultValue = node.defaultValue ? this.build( node.defaultValue ) : null;
        let value = initValue;
        if( node.initValue && (node.isObjectPattern || node.isArrayPattern) && node.propName != null )
        {
            if( node.isObjectPattern )
            {
                value = `${initValue}.${node.propName}`;
            }else if( node.isArrayPattern )
            {
                value = `${initValue}[${node.propName}]`;
            }
        }

        if( defaultValue ){
            return `${key} = ${value} || ${defaultValue}`;
        }
        return `${key} = ${value}`;
    }


    FunctionDeclaration(node,scope,parent)
    {
        const key = node.key;
        const body = this.build( node.body );
        const defaultValues=[];
        const args = node.params.map( (item,index)=>{
            if( item.isRest )
            {
               defaultValues.push( this.semicolon(node.scope,`${item.key}=arguments.slice(${index})`) );
            }
            if( item.initValue )
            {
                const value = this.build( item.initValue );
                let expre = `${item.key} = ${item.key} === void 0 ? ${value} : ${item.key}`;
                if( item.isRest ){
                    expre = `${item.key} = ${item.key}.length === 0 ? [].concat(${value}) : ${item.key}`;
                }
                defaultValues.push( this.semicolon(node.scope,expre) );
            }
            return item.key;
        });
        const expression = defaultValues.concat(body).join("");
        const indent = this.getIndent(node.scope.parent.getScopeByType("function"));
        return `${indent}function ${key}(${args.join(",")}){\r\n${expression}${indent}}\r\n`;
    }

    EnumDeclaration(node)
    {
        const key = node.key;
        const properties = node.initValue.map( (item)=>{
            return `"${item.key}":${this.build(item)}`;
        });
        let obj = `{${properties.join(",")}}`;
        if( node.inhiert )
        {
            obj =`Object.assign(${this.build(node.inhiert)}, obj)`;
        }
        const expres = `var ${key} = ${obj}`;
        return this.semicolon(node.scope, expres);
    }

    ClassDeclaration(node, scope, parent)
    {
        node.body.forEach( (item)=>{
            this.build( item )
        })
    }

    InterfaceDeclaration(node)
    {
        node.body.forEach( (item)=>{
            this.build( item )
        })
    }

    DeclaratorDeclaration(node)
    {
        node.body.forEach( (item)=>{
            this.build( item )
        })
    }

    PackageDeclaration(node)
    {
        node.body.forEach( (item)=>{
            this.build( item )
        })
    }

    PropertyDefinition(){

    }


    MethodDefinition(node)
    {
        const key  = node.key;
        const body = this.build( node.value.body );
        const defaultValues=[];
        const args = node.value.params.map( (item,index)=>{
           if( item.isRest )
           {
              defaultValues.push( this.semicolon(node.scope,`${item.key}=arguments.slice(${index})`) );
           }
           if( item.initValue )
           {
                const value = this.build( item.initValue );
                let expre = `${item.key} = ${item.key} === void 0 ? ${value} : ${item.key}`;
                if( item.isRest ){
                    expre = `${item.key} = ${item.key}.length === 0 ? [].concat(${value}) : ${item.key}`;
                }
                defaultValues.push( this.semicolon(node.scope,expre) );
           }
           return item.key;
        });
        const expression = defaultValues.concat( body ).join("");
        const indent     = this.getIndent(node.scope.getScopeByType("class"));
        const expre = `${indent}function ${key}(${args.join(",")}){\r\n${expression}${indent}}`;

        console.log( expre );
    }

    Program(node)
    {
       node.body.forEach( (item)=>{
             this.build( item )
       })
    }

    Identifier(node)
    {
        return node.value;
    }

    Literal(node)
    {
        return node.value;
    }


    build( node )
    {
        if( node )
        {
           return this[node.node.type]( node );
        }
        return null;
    }
}

module.exports = Grammar;