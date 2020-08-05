const BlockScope = require("./scope");
const ClassScope = require("./scope/ClassScope");
const FunctionScope = require("./scope/FunctionScope");
const Description = require("./Description");

class Grammar {

    constructor(compilation)
    {
       this.compilation = compilation;
       this.description = new Description();
       this.annotations = [];
       this.metatypes   = [];
       this.scope=null;
    }

    memberExpression(node,scope, parent)
    {
        const member = [this.parser(node.object, scope, node), node.property.value || node.property.name ];
        return this.makeMemberExpression( member );
    }

    objectExpression(node,scope, parent)
    {
        return this.makeObjectExpression(scope, node.properties.map( (child)=>{
            const key = this.parser(child.key,scope,node);
            const value = this.parser(child.value,scope,node);
            return this.makeObjectKeyValue(key,value);
        }));
    }

    arrowFunctionExpression(node,scope,parent)
    {
        const fnScope = scope.getScopeByType("function");
        const has = fnScope.createThisRef();
        if( has ){
           const name = fnScope.getThisRef();
           fnScope.pushBefore( this.semicolon(
                scope,
                this.makeDeclarationVariable(
                    "const",
                    this.makeAssign(name,this.makeThisExpression(),null,this.description.id)
                )
            ));
        }
        return this.functionExpression(node,scope,parent,true);
    }

    parserFunctionParams(scope,items)
    {
        const params={};
        items.forEach( (item)=>{
            let name = "";
            let type = null;
            let defaultValue = void 0;
            if( item.type === "AssignmentPattern" )
            {
                name = this.parser(item.left,scope,item);
                type = this.parser(item.left.acceptType,scope,item.left);
                defaultValue = this.parser(item.right,scope,item);
                
            }else
            {
                name =  this.parser(item,scope,node);
                type = this.parser(item.acceptType,scope,node);
            }
            params[name] = {name,type,defaultValue};
            scope.define(name,type);
        });
        return params;
    }

    functionExpression(node,scope,parent,isArrow)
    {
        scope = new FunctionScope( scope, !!node.static , isArrow );

        let key = null;
        if( parent && parent.type ==="MethodDefinition" )
        {
            key = this.parser(parent.key,scope,node);
            if( !key && parent.kind === "constructor" )
            {
                key = "constructor";
            }
        }
        const params= this.parserFunctionParams(scope,node.params);
        const body  = this.parser(node.body,scope,node);
        return this.makeFunctionExpression( scope.parent, body, key, params );
    }

    arrayExpression(node,scope, parent){

        const elements = node.elements.map( (item)=>{
            return this.parser(item,scope,node);
        });
        return `[${elements.join(",")}]`;
    }

    logicalExpression(node,scope, parent)
    {
        const left =  this.parser(node.left,scope,node);
        const right =  this.parser(node.right,scope,node);
        const operator = node.operator || "||";
        return `${left} ${operator} ${right}`;
    }

    assignmentExpression(node, scope, parent)
    {
        const name = node.name;
        const value = this.parser( node.value );
        if( value ){
            return `${name} = ${value}`;
        }
        return name;
    }

    thisExpression(node, scope, parent)
    {
        return this.makeThisExpression( scope );
    }

    binaryExpression(node, scope, parent)
    {
         const left = this.parser(node.left,scope,node);
         const operator = node.operator;
         const right = this.parser(node.right,scope,node);
         return `${left} ${operator} ${right}`;
    }

    callExpression(node, scope, parent)
    {
        const target = this.parser(node.callee,scope,node);
        const args = node.arguments.map( (item)=>{
           return this.parser(item,scope,node);
        });
        return this.makeCallExpression(target, args);
    }

    expressionStatement(node,scope, parent)
    {
        return this.semicolon( scope, this.parser(node.expression,scope,node) );
    }

    updateExpression(node,scope, parent)
    { 
        const operator = node.operator;
        const target = this.parser(node.argument, scope, node);
        return this.makeUpdateExpression(target,operator,node.prefix);
    }

    blockStatement(node,scope,parent)
    {
        let isFn = false;
        switch( parent && parent.type ){
            case "FunctionExpression" :
            case "FunctionDeclaration" :
            case "ArrowFunctionExpression" :
                isFn = true;
            break;
        }

        scope = isFn? scope : new BlockScope( scope );
        const body = node.body.map( (item)=>{
            return this.parser(item,scope,node);
        });
        return scope.before.concat( body, scope.after ).join("");
    }

    ifStatement(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const consequent = this.parser(node.consequent,scope,node);
        const alternate  = this.parser(node.alternate,scope,node);
        const expre = this.makeIfStatement(scope,condition, consequent, alternate);
        return this.semicolon(scope,expre,true);
    }

    whileStatement(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const body  = this.parser(node.body,scope,node);
        const expre = this.makeWhileStatement(scope,condition, body );
        return this.semicolon(scope,expre,true);
    }

    doWhileStatement(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const body =  this.parser(node.body,scope,node);
        const expre = this.makeDoWhileStatement(scope,condition, body );
        return this.semicolon(scope,expre);
    }

    switchStatement(node,scope,parent)
    {
        const condition  = this.parser(node.discriminant,scope,node);
        const block = new BlockScope(scope);
        const cases = node.cases.map( (item)=>{
            return this.parser(item,block,node);
        });
        const expre = this.makeSwitchStatement(scope,condition, cases.join("") );
        return this.semicolon(scope, expre, true);
    }

    switchCase(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const block = new BlockScope(scope);
        const body = node.consequent.map( (item)=>{
            return this.parser(item,block,node);
        });
        return this.makeSwitchCaseStatement(scope, condition, body.join("") );
    }

    breakStatement(node,scope,parent)
    {
       return this.semicolon(scope, this.makeBreakStatement(scope) );
    }

    forStatement(node,scope,parent)
    {
        const init = this.parser(node.init,scope,node);
        const test = this.parser(node.test,scope,node);
        const update = this.parser(node.update,scope,node);
        const body = this.parser(node.body,scope,node); 
        const code = this.makeForStatement(scope,init,test,update,body);
        return this.semicolon(scope,code,true);
    }

    forInStatement(node,scope,parent)
    {
        const init = this.parser(node.left,scope,node);
        const right = this.parser(node.right,scope,node);
        const body = this.parser(node.body,scope,node);
        const code = this.makeForInStatement(scope,init,right,body);
        return this.semicolon(scope,code,true);
    }

    forOfStatement(node,scope,parent)
    {
        const init = this.parser(node.left,scope,node);
        const right= this.parser(node.right,scope,node);
        const body = this.parser(node.body,scope,node); 
        const code = this.makeForOfStatement(scope,init,right,body);
        return this.semicolon(scope,code,true);
    }

    whenStatement(node,scope, parent)
    {
        const name = node.test.callee.name;
        const args = node.test.arguments.map( (item)=>{
             return item.name;
        });

        let consequent = false;
        switch( name ){
            case "Runtime" :
                consequent = this.isRuntime( args[0] )
            break;
        }

        let body = [];
        if( consequent )
        {
            body = node.consequent.body.map( (item)=>{
                return this.parser(item,scope,node.consequent);
            });

        }else if( node.alternate )
        {
            body = node.alternate.body.map( (item)=>{
                return this.parser(item,scope,node.alternate);
            });
        }
        return body.join("");
    }

    importSpecifier(node, scope,parent)
    {
        return this.parser( node.expression, scope, node )
    }

    importDeclaration(node, scope,parent)
    {
        const specifiers = this.parser(node.specifiers,scope,node);
        this.description.addDepend(specifiers.split(".").pop(), specifiers );
    }

    variableDeclaration(node,scope,parent)
    {
        const kind = node.kind;
        const declarations = []
        node.declarations.forEach( (item)=>{
            const declars = this.parser(item,scope,node);
            declars.forEach( (declar)=>{
                if( declar.init === null )
                {
                    declarations.push( this.makeAssign(declar.id,null,null,declar.acceptType) ); 
                }else{
                    declarations.push( this.makeAssign(declar.id,declar.init,declar.defaultValue,declar.acceptType) );  
                }
            });
        });

        switch( parent && parent.type )
        {
            case "ForStatement":
            case "ForInStatement":
            case "ForOfStatement":
                return this.makeDeclarationVariable(kind, declarations.join(",") );
        }

        return this.semicolon(scope, this.makeDeclarationVariable(kind, declarations.join(",") ) );
    }

    variableDeclarator(node,scope,parent)
    {
        if( node.id && node.id.type ==="ArrayPattern" )
        {
            let initType = node.init.type;
            let initVlaue = null;
            if( initType==="ArrayExpression" )
            {
                initVlaue=node.init.elements.map( (item)=>{
                   return this.parser(item);
                });

            }else{
                initVlaue = this.parser(node.init,scope,node);
            }

            return node.id.elements.map( (item,index)=>{

                const init = initType==="ArrayExpression" ? initVlaue[ index ] : `${initVlaue}[${index}]`;
                const id = this.parser(item,scope, node.id);  
                const acceptType =  item.acceptType ? this.parser(item.acceptType,scope,item) : null; 
                scope.define(id, acceptType);
                return {id,acceptType,init};

            });
           
        }else if( node.id && node.id.type ==="ObjectPattern" )
        {
            let initType = node.init.type;
            let initVlaue = null;
            if( initType==="ObjectExpression")
            {
                initVlaue = {};
                node.init.properties.forEach( (child)=>{
                    const key = this.parser(child.key,scope,child);
                    const value = this.parser(child.value,scope,child);
                    initVlaue[ key ] = value;
                });

            }else{
                initVlaue =this.parser(node.init,scope,node);
            }

            return node.id.properties.map( (item,index)=>{
                const acceptType = this.parser(item.acceptType,scope, node.id)
                const id = this.parser(item.key,scope, node.id);
                const init = this.parser(item.value.right,scope, node.id);
                scope.define(id, acceptType);
                if( initType==="ObjectExpression" ){
                    return {id,acceptType,init:initVlaue[id] || init };
                }else{
                   return {id,acceptType,init:`${initVlaue}["${id}"]`,defaultValue:init };
                }
            });
        }

        const id = this.parser(node.id,scope,node);  
        const acceptType =  node.id ? this.parser(node.id.acceptType,scope,node) : null; 
        const init =  this.parser(node.init,scope,node);
        scope.define(id, acceptType);
        return [{id,acceptType,init}];
    }

    functionDeclaration(node,scope,parent)
    {
        const key = this.parser(node.id,scope,node);
        const fnScope = new FunctionScope(scope);
        const params = this.parserFunctionParams(fnScope,node.params)
        const body = this.parser(node.body,fnScope,node);
        return this.semicolon(scope, this.makeFunctionExpression(scope, body, key, params ) , true );
    }

    enumDeclaration(node,scope,parent)
    {
        const id = node.name;
        const inherit = this.parser(node.extends,scope,node);
        const properties = [];
        let lastValue = 0;
        node.value.expressions.forEach( (item,index)=>{
            const key = item.left ? this.parser(item.left,scope,item) : item.name;
            const value = item.right ? this.parser(item.right,scope,item) : lastValue++;
            if( item.right && typeof item.right.value ==="number" ){
                lastValue = item.right.value+1;
            }
            properties.push( this.makeObjectKeyValue(key,value) )
        });

        scope.define(id,"Object");
        const obj = this.makeObjectExpression(scope,properties);
        const expres = this.makeEnumDeclaration( inherit, obj );
        return this.semicolon( scope, this.makeDeclarationVariable("var", this.makeAssign(id,expres,null,"Object") ) );
    }

    modifierDeclaration(node,scope,parent)
    {
        return node.value || node.name
    }

    annotationDeclaration(node, scope, parent)
    {
        const name = node.name;
        const params = [];
        node.body.forEach((item)=>{
            const name = item.name;
            const value = this.parser(item.value);
            params.push({name,value});
        });
        this.annotations.push({name,params});
    }

    metatypeDeclaration(node, scope, parent)
    {
        const name = node.name;
        const params = [];
        node.body.forEach((item)=>{
            const name = item.name;
            const value = this.parser(item.value);
            params.push({name,value});
        });
        this.metatypes.push({name,params});
    }

    classDeclaration(node, scope, parent)
    {
        const description = this.description;
        description.id = this.parser(node.id, scope, node);
        description.extends = this.parser(node.superClass, scope, node);
        (node.implements || []).forEach( (item)=>{
            description.implements.push( this.parser(item, scope, node) );
        });
        description.modifier = this.parser(node.modifier,scope,node);
        scope = new ClassScope( scope, !!node.static );
        const body= (node.body && node.body.body)||[];
        description.metatypes = this.metatypes.splice(0,this.metatypes.length);
        description.annotations = this.annotations.splice(0,this.annotations.length);
        (body).forEach( (item)=>{
            this.parser(item,scope,node);
        });
    }

    packageDeclaration(node,scope, parent)
    {
       const description = this.description;
       const id = node.id ? this.parser(node.id,scope,node) : null;
       description.namespace = id;
       this.enter( node.body, scope, node );
    }

    typeDefinition( node,scope, parent)
    {
       const type = this.parser(node.value,scope,node);  
       return type;
    }

    propertyDefinition(node,scope, parent)
    {
        const description = this.description;
        const kind = node.kind;
        const modifier = this.parser(node.modifier,scope, node);
        const declar   = this.parser(node.declarations[0],scope,node);
        declar.isStatic = !!node.static;
        declar.modifier = modifier;
        declar.kind     = kind;
        declar.metatypes = this.metatypes.splice(0,this.metatypes.length);
        declar.annotations = this.annotations.splice(0,this.annotations.length);
        description.addMember(declar.id, declar);
    }

    methodDefinition(node,scope, parent)
    {
        const description = this.description;
        const kind = node.kind;
        const key =  this.parser(node.key,scope, node);
        const modifier = this.parser(node.modifier,scope, node);
        const declar = {kind,key,modifier,isStatic:!!node.static};
        declar.metatypes = this.metatypes.splice(0,this.metatypes.length);
        declar.annotations = this.annotations.splice(0,this.annotations.length);
        description.addMember(key, declar);
        const body = this.parser( node.value, scope, node);

        console.log( body )

    }

    program(node, scope, parent)
    {
       return this.enter(node.body, scope, node);
    }

    enter(body, scope, parent)
    {
        return body instanceof Array && body.map( (item)=>{
            return this.parser( item, scope, parent );
        }).join("");
    }

    identifier(node,scope, parent)
    {
        return node.value || node.name
    }

    literal(node,scope, parent)
    {
        return node.raw || node.value || node.name
    }

    parser(node,scope,parent=null)
    {
        if( !node )
        {
            return null;
        }

        const type = node.type.substr(0,1).toLowerCase()+node.type.slice(1);
        if( this[ type ] )
        {
            return this[ type ](node,scope,parent);
        }
    }
}

module.exports = Grammar;