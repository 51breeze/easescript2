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

    MemberExpression(node,scope,parent,flag=true)
    {
       
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

        let rest = '';
        const params = node.params.map( item=>{
            if( item.isRest ){
                rest = `${item.key}=arguments;` 
                return '';
            }
            return item.key;
        });
        const key = node.key ? " "+node.key : '';
        const body = this.build( node.body );
        return `function${key}(${params.join(",")}){${body}}`;
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

    ThisExpression(node, scope, parent)
    {
         return "this";
    }

    BinaryExpression(node, scope, parent)
    {
        const left = this.build(node.left);
        const right = this.build(node.right);
        const operator = node.operator;
        return `${left} ${operator} ${right}`; 
    }

    CallExpression(node, scope, parent)
    {
        const member = node.callee.member.map( item=>item.name );
        const args   = node.arguments.map( item=>this.build(item) );
        return `${member.join(".")}(${args.join(",")})`;
    }

    NewExpression(node, scope, parent)
    {
        const member = node.callee.member ? node.callee.member.map( item=>item.name ) : [node.callee.value];
        const args   = node.arguments.map( item=>this.build(item) );
        return `new ${member.join(".")}(${args.join(",")})`;
    }

    RestElement(node, scope, parent)
    {
      
    }

    SpreadElement(node, scope, parent)
    {
       
    }

    ReturnStatement(node,scope, parent)
    {
        const expre = this.build( node.argument );
        return `return ${expre}`;
    }

    ExpressionStatement(node,scope, parent)
    {
        return this.build(node.expression);
    }

    UpdateExpression(node,scope, parent)
    { 
        const argument = this.build(node.argument);
        const operator = node.operator;
        const prefix = node.prefix;
        if( prefix ){
            return `${operator}${argument}`;
        }
        return `${argument}${operator}`;
       
    }

    UnaryExpression(node,scope, parent)
    {

        console.log( node );

        process.exit();
       
    }

    BlockStatement(node)
    {
       const body = node.body.map( item=>this.build(item) );
       return body;
    }

    IfStatement(node,scope,parent)
    {
         const condition  = this.build(node.condition);
         const consequent = this.build(node.consequent);
         const alternate  = this.build(node.alternate);
         return `if(${condition}){${consequent}}else{${alternate}}`;
    }

    WhileStatement(node,scope,parent)
    {
        const condition  = this.build(node.condition);
        const body = this.build(node.body);
        return `while(${condition}){${body.join(",")}}`;
    }

    DoWhileStatement(node,scope,parent)
    {
        const condition  = this.build(node.condition);
        const body = this.build(node.body);
        return `do{${body.join(",")}}while(${condition})`;
    }

    SwitchStatement(node,scope,parent)
    {
        const condition  = this.build(node.condition);
        const cases = node.cases.map( item=>this.build(item) );
        return `switch(${condition}){${cases.join("\r\n")}}`;
       
    }

    SwitchCase(node,scope,parent)
    {
       const condition = this.build( node.condition );
       const body      = node.body.map( item=>this.build( item ) );
       return `case ${condition} : ${body.join("\r\n")}`;
    }

    BreakStatement(node,scope,parent)
    {
        return "break;";
    }

    ForStatement(node,scope,parent)
    {
        const init = this.build( node.init );
        const condition = this.build( node.condition );
        const update    = this.build(node.update );
        const body    = this.build(node.body );
        return `for(${init};${condition},${update}){${body.join("\r\n")}}`;
    }

    ForInStatement(node,scope,parent)
    {
        const init = this.build( node.init );
        const condition = this.build( node.condition );
        const update    = this.build(node.update );
        const body    = this.build( node.body );
        return `for(${init};${condition},${update}){${body.join("\r\n")}}`;
    }

    ForOfStatement(node,scope,parent)
    {
        const left = this.build( node.left );
        const right= this.build( node.right );
        const body = this.build( node.body );
        return `for( ${left} of ${right} ){${body.join("\r\n")}}`;
    }

    TryStatement(node,scope, parent)
    {
        const handler = this.build( node.handler.body );
        const name =  node.handler.name;
        const type =  node.handler.acceptType;
        const body = this.build( node.body );
        return `try{ ${body.join("\r\n")} }catch(${name}){ ${handler.join("\r\n")} }`;
    }

    WhenStatement(node,scope, parent)
    {
        return node.body.map( item=>this.build(item) ).join("\r\n");
    }

    ImportSpecifier(node, scope,parent)
    {
       
    }

    ImportDeclaration(node, scope,parent)
    {
       
    }

    VariableDeclaration(node,scope,parent)
    {
        const declarations = node.declarations.map( item=>{
            return this.VariableDeclarator( item );
        });
        return this.makeDeclarationVariable(node.scope, node.kind, declarations, node.flag );
    }

    VariableDeclarator(node)
    {
        const key =  node.key;
        const initValue = this.build( node.initValue );
        const defaultValue = node.defaultValue ? this.build( node.defaultValue ) : null;
        return this.makeAssign(key,initValue,defaultValue);
    }


    FunctionDeclaration(node,scope,parent)
    {
        const key = node.key;
        const returnType = this.build(node.returnType);
        const args = node.params.map( item=>{
            return item.key
        });
        const body = this.build( node.body );
        return `function ${key}(${args.join(",")}){ ${body.join("") }}`;
    }

    EnumDeclaration(node,scope,parent)
    {
        const key = node.key;
        const properties = node.initValue.map( (item)=>{
            return this.makeObjectKeyValue( item.key, item.value );
        });
        const value = this.makeObjectExpression(scope,properties);
        return `var ${key}=${value}`;
    }

    ModifierDeclaration(node,scope,parent)
    {
        
    }

    AnnotationDeclaration(node, scope, parent)
    {
      
    }

    MetatypeDeclaration(node, scope, parent)
    {
       
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

    TypeDefinition(node)
    {
       
    }

    PropertyDefinition(node)
    {
       
    }

    MethodDefinition(node)
    {
       const code = this.build( node.value );
       console.log( code )
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