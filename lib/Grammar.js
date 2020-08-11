const BlockScope = require("./scope/BlockScope.js");
const ClassScope = require("./scope/ClassScope.js");
const FunctionScope = require("./scope/FunctionScope.js");
const Description = require("./Description.js");
const Parameter = require("./Parameter.js");
const Declarator = require("./Declarator.js");
const Namespace  = require("./Namespace.js")

class Grammar {

    constructor(compilation)
    {
       this.compilation = compilation;
       this.annotations = [];
       this.metatypes   = [];
       this.scope=null;
       this.hasStruct = false;
    }

    MemberExpression(node,scope,parent)
    {
        const member = [];
        const memberExpression = (node)=>{
            let name = this.parser(node.property,scope,node);
            if( node.object.type ==="MemberExpression" )
            {
                memberExpression( node.object );
            }else{
                let target = this.parser(node.object,scope,node);
                if( !scope.isDefine( target ) )
                {
                    this.compilation.getDescribe( target );
                }
                member.push( target );
            }
            member.push( name );
            return member;
        }
        return this.makeMemberExpression( memberExpression(node) );
    }

    ObjectExpression(node,scope, parent)
    {
        return this.makeObjectExpression(scope, node.properties.map( (child)=>{
            const key = this.parser(child.key,scope,node);
            const value = this.parser(child.value,scope,node);
            return this.makeObjectKeyValue(key,value);
        }));
    }

    ArrowFunctionExpression(node,scope,parent)
    {
        const fnScope = scope.getScopeByType("function");
        const has = fnScope.createThisRef();
        if( has ){
           const name = fnScope.getThisRef();
           fnScope.pushBefore( this.semicolon(
                scope,
                this.makeDeclarationVariable(
                    "const",
                    this.makeAssign(name,this.makeThisExpression(),null,this.compilation.module.id)
                )
            ));
        }
        return this.FunctionExpression(node,scope,parent,true);
    }

    parserFunctionParams(scope,items,parent)
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
                name =  this.parser(item,scope,parent);
                type = this.parser(item.acceptType,scope,parent);
            }
            params[name] = new Parameter(name, defaultValue, type, "var");
            scope.define(name, params[name] );
        });
        return params;
    }

    FunctionExpression(node,scope,parent,isArrow)
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
        scope.parent.removeChild( scope );
        return this.makeFunctionExpression( scope.parent, body, key, params );
    }

    ArrayExpression(node,scope, parent){ 

        const elements = node.elements.map( (item)=>{
            return this.parser(item,scope,node);
        });
        return this.makeArrayExpression( scope, elements );
    }

    LogicalExpression(node,scope, parent)
    {
        const left =  this.parser(node.left,scope,node);
        const right =  this.parser(node.right,scope,node);
        const operator = node.operator || "||";
        return `${left} ${operator} ${right}`;
    }

    AssignmentExpression(node, scope, parent)
    {
        const name = node.name;
        const value = this.parser( node.value );
        if( value ){
            return `${name} = ${value}`;
        }
        return name;
    }

    ThisExpression(node, scope, parent)
    {
        return this.makeThisExpression( scope );
    }

    BinaryExpression(node, scope, parent)
    {
         const left = this.parser(node.left,scope,node);
         const operator = node.operator;
         const right = this.parser(node.right,scope,node);
         return `${left} ${operator} ${right}`;
    }

    CallExpression(node, scope, parent)
    {
        const target = this.parser(node.callee,scope,node);
        const args = node.arguments.map( (item)=>{
           this.checkIdentifierStatement(item,scope)
           return this.parser(item,scope,node);
        });
        return this.makeCallExpression(target, args);
    }

    checkIdentifierStatement(node,scope)
    {
        if( node.type ==="Identifier" )
        {
            const name = node.name;
            if( !scope.isDefine( name ) )
            {
                this.compilation.throwError(`"${name}" is not defined.`, node.end , name );
            }
        }
    }

    ReturnStatement(node,scope, parent)
    {
        let expre = this.parser(node.argument,scope,node);
        expre = this.makeReturnStatement( node , expre);
        return this.semicolon( scope, expre );
    }

    ExpressionStatement(node,scope, parent)
    {
        this.checkIdentifierStatement(node.expression,scope);
        const expre = this.parser(node.expression,scope,node);
        return this.semicolon( scope, expre );
    }

    UpdateExpression(node,scope, parent)
    { 
        const operator = node.operator;
        const target = this.parser(node.argument, scope, node);
        return this.makeUpdateExpression(target,operator,node.prefix);
    }

    BlockStatement(node,scope,parent)
    {
        let isFn = false;
        switch( parent && parent.type ){
            case "FunctionExpression" :
            case "FunctionDeclaration" :
            case "ArrowFunctionExpression" :
                isFn = true;
            break;
        }
        const newScope = isFn ? scope : new BlockScope( scope );
        const body = node.body.map( (item)=>{
            return this.parser(item,newScope,node);
        });
        if( newScope !== scope )
        {
            newScope.parent.removeChild( newScope );
        }
        return newScope.before.concat( body, newScope.after ).join("");
    }

    IfStatement(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const consequent = this.parser(node.consequent,scope,node);
        const alternate  = this.parser(node.alternate,scope,node);
        const expre = this.makeIfStatement(scope,condition, consequent, alternate);
        return this.semicolon(scope,expre,true);
    }

    WhileStatement(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const body  = this.parser(node.body,scope,node);
        const expre = this.makeWhileStatement(scope,condition, body );
        return this.semicolon(scope,expre,true);
    }

    DoWhileStatement(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const body =  this.parser(node.body,scope,node);
        const expre = this.makeDoWhileStatement(scope,condition, body );
        return this.semicolon(scope,expre);
    }

    SwitchStatement(node,scope,parent)
    {
        const condition  = this.parser(node.discriminant,scope,node);
        const blockScope = new BlockScope(scope);
        const cases = node.cases.map( (item)=>{
            return this.parser(item,blockScope,node);
        });
        const expre = this.makeSwitchStatement(scope, condition, cases.join("") );
        scope.removeChild( blockScope );
        return this.semicolon(scope, expre, true);
    }

    SwitchCase(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        const blockScope = new BlockScope(scope);
        const body = node.consequent.map( (item)=>{
            return this.parser(item,blockScope,node);
        });
        scope.removeChild( blockScope );
        return this.makeSwitchCaseStatement(scope, condition, body.join("") );
    }

    BreakStatement(node,scope,parent)
    {
       return this.semicolon(scope, this.makeBreakStatement(scope) );
    }

    ForStatement(node,scope,parent)
    {
        const init = this.parser(node.init,scope,node);
        const test = this.parser(node.test,scope,node);
        const update = this.parser(node.update,scope,node);
        const body = this.parser(node.body,scope,node); 
        const code = this.makeForStatement(scope,init,test,update,body);
        return this.semicolon(scope,code,true);
    }

    ForInStatement(node,scope,parent)
    {
        const init = this.parser(node.left,scope,node);
        const right = this.parser(node.right,scope,node);
        const body = this.parser(node.body,scope,node);
        const code = this.makeForInStatement(scope,init,right,body);
        return this.semicolon(scope,code,true);
    }

    ForOfStatement(node,scope,parent)
    {
        const init = this.parser(node.left,scope,node);
        const right= this.parser(node.right,scope,node);
        const body = this.parser(node.body,scope,node); 
        const code = this.makeForOfStatement(scope,init,right,body);
        return this.semicolon(scope,code,true);
    }

    TryStatement(node,scope, parent)
    {
        const body = this.parser( node.block, scope, node);
        const paramName = this.parser( node.handler.param, scope, node);
        const paramType = this.parser( node.handler.param.acceptType, scope, node);
        const handler   = this.parser( node.handler.body, scope, node);
        const code = this.makeTryStatement(scope,body,handler,paramName,paramType);
        return this.semicolon(scope,code,true);
    }

    WhenStatement(node,scope, parent)
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

    ImportSpecifier(node, scope,parent)
    {
        return this.parser( node.expression, scope, node )
    }

    ImportDeclaration(node, scope,parent)
    {
        const specifiers = this.parser(node.specifiers,scope,node);
        this.compilation.module.addDepend(specifiers.split(".").pop(), specifiers );
    }

    VariableDeclaration(node,scope,parent)
    {
        const kind = node.kind;
        const declarations = []
        node.declarations.forEach( (item)=>{
            const declars = this.parser(item,scope,node);
            declars.forEach( (declar)=>{
                if( declar.initValue === null )
                {
                    declarations.push( this.makeAssign(declar.name,null,null,declar.type) ); 
                }else{
                    declarations.push( this.makeAssign(declar.name,declar.initValue,declar.defaultValue,declar.type) );  
                }
            });
        });

        switch( parent && parent.type )
        {
            case "ForStatement":
            case "ForInStatement":
            case "ForOfStatement":
                return this.makeDeclarationVariable(scope, kind, declarations.join(","), true );
        }

        return this.semicolon(scope, this.makeDeclarationVariable(scope, kind, declarations.join(",") ) );
    }

    VariableDeclarator(node,scope,parent)
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
                const declar = new Declarator( id, init,acceptType, parent.kind);
                scope.define(id, declar);
                return declar;
            });
           
        }else if( node.id && node.id.type ==="ObjectPattern" )
        {
            let initType = node.init.type;
            let initVlaue = {};
            if( initType==="ObjectExpression")
            {
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
                const declar = new Declarator( id, init, acceptType, parent.kind);
                scope.define(id, declar);
                if( initType==="ObjectExpression" ){
                    declar.initValue = initVlaue[id] || init;
                    return declar;
                }else{
                    declar.initValue = `${initVlaue}["${id}"]`;
                    declar.defaultValue = init;
                   return declar;
                }
            });
        }

        const id = this.parser(node.id,scope,node);  
        const acceptType =  node.id ? this.parser(node.id.acceptType,scope,node) : null; 
        const init =  this.parser(node.init,scope,node);
        const declar = new Declarator( id, init, acceptType, parent.kind);
        scope.define(id, declar);
        return [declar];
    }

    FunctionDeclaration(node,scope,parent)
    {
        const key = this.parser(node.id,scope,node);
        const fnScope = new FunctionScope(scope);
        const params = this.parserFunctionParams(fnScope,node.params)
        const body = this.parser(node.body,fnScope,node);
        return this.semicolon(scope, this.makeFunctionExpression(scope, body, key, params ) , true );
    }

    EnumDeclaration(node,scope,parent)
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

    ModifierDeclaration(node,scope,parent)
    {
        return node.value || node.name
    }

    AnnotationDeclaration(node, scope, parent)
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

    MetatypeDeclaration(node, scope, parent)
    {
        const name = node.name;
        const params = [];
        node.body.forEach((item)=>{
            const name = item.name;
            const value = this.parser(item.value,scope,item);
            params.push({name,value});
        });
        this.metatypes.push({name,params});
    }

    ClassDeclaration(node, scope, parent)
    {
        const module = this.compilation.module;
        module.id = this.parser(node.id, scope, node);
        module.extends = this.parser(node.superClass, scope, node);
        (node.implements || []).forEach( (item)=>{
            module.implements.push( this.parser(item, scope, node) );
        });
        module.modifier = this.parser(node.modifier,scope,node);
        module.metatypes   = this.metatypes.splice(0,this.metatypes.length);
        module.annotations = this.annotations.splice(0,this.annotations.length);
        module.type = module.namespace.identifier+"."+module.id;
        module.namespace.addModule(module.id, module);
        const body= (node.body && node.body.body)||[];

        const parseStruct = (flag)=>{
            this.hasStruct = flag;
            const classScope = new ClassScope( scope, !!node.static );
            (body).forEach( (item)=>{
                if( !flag || item.type==="MethodDefinition")
                {
                   this.parser(item,classScope,node);
                }
            });
            scope.removeChild(classScope);
        }
        parseStruct(false);
        parseStruct(true);
    }

    PackageDeclaration(node,scope, parent)
    {
        const id = node.id ? this.parser(node.id,scope,node) : null;
        this.compilation.module.namespace = Namespace.fetch( id );
        this.enter( node.body, scope, node );
    }

    TypeDefinition( node,scope, parent)
    {
       const type = this.parser(node.value,scope,node);  
       return type;
    }

    PropertyDefinition(node,scope, parent)
    {
        const kind = node.kind;
        const modifier = this.parser(node.modifier,scope, node);
        const declar   = this.parser(node.declarations[0],scope,node);
        const desc = new Description(kind,declar.id,declar.type);
        desc.static = !!node.static;
        desc.modifier = modifier;
        desc.type = declar.acceptType;
        desc.defaultValue = declar.init;
        desc.metatypes = this.metatypes.splice(0,this.metatypes.length);
        desc.annotations = this.annotations.splice(0,this.annotations.length);
        this.compilation.module.addMember(desc.id, desc);
    }

    MethodDefinition(node,scope, parent)
    {
       const key =  this.parser(node.key, scope, node);
       const isStatic = !!node.static;
       const module = this.compilation.module;
       if( !this.hasStruct )
       {
            const kind = node.kind;
            const modifier = this.parser(node.modifier,scope, node);
            const desc = new Description(kind,key);
            desc.static = isStatic;
            desc.modifier = modifier;
            desc.metatypes = this.metatypes.splice(0,this.metatypes.length);
            desc.annotations = this.annotations.splice(0,this.annotations.length);
            desc.params = this.parserFunctionParams( scope, node.value.params );
            desc.type = this.parser(node.value.returnType, scope, node);
            if( kind ==="constructor" || module.id === key )
            {
                desc.type = module.id;
                module.constructor = desc;
            }
            module.addMember(key, desc);

       }else
       {
            let desc = this.compilation.getDescribe( key, isStatic );
            desc.body = this.parser( node.value, scope, node);
            //console.log( desc.body )
       }

    }

    Program(node, scope, parent)
    {
       return this.enter(node.body, scope, node);
    }

    Identifier(node,scope, parent)
    {
        const name = node.value || node.name;
        return name;
    }

    Literal(node,scope, parent)
    {
        return node.raw || node.value || node.name
    }

    enter(body, scope, parent)
    {
        return body instanceof Array && body.map( (item)=>{
            return this.parser( item, scope, parent );
        }).join("");
    }

    parser(node,scope,parent=null)
    {
        if( !node )
        {
            return null;
        }
        return this[ node.type ](node,scope,parent);
    }
}

module.exports = Grammar;