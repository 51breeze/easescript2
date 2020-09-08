const BlockScope = require("./scope/BlockScope.js");
const ClassScope = require("./scope/ClassScope.js");
const FunctionScope = require("./scope/FunctionScope.js");
const PropertyDescription = require("./PropertyDescription.js");
const MethodDescription = require("./MethodDescription.js");
const Parameter = require("./Parameter.js");
const Declarator = require("./Declarator.js");
const Namespace  = require("./Namespace.js");
const Type  = require("./Type.js");
const Expression  = require("./Expression.js");
const Enum  = require("./Enum.js");
const Declaration  = require("./Declaration.js");
const Intersection  = require("./Intersection.js");
const Union  = require("./Union.js");
const Module = require("./Module.js");

class Grammar {

    constructor(compilation)
    {
       this.compilation = compilation;
       this.module = compilation.module;
       this.annotations = [];
       this.metatypes   = [];
       this.scope=null;
       this.hasStruct = false;
       this.expressionReference=[];
    }

    error(message, node)
    {
        this.compilation.throwError(message, node.start );
    }

    MemberExpression(node,scope,parent)
    {
        const member = [];
        const flag   = !!this.module.namespace;
        let base     = null;
        let isStatic = false;
        const check=(name, base)=>{

            if( base === null && scope.isDefine( name ) )
            {
                return scope.define( name );
            }
            base = this.compilation.getReference(name, base, isStatic);
            if( !base )
            {
                this.error( `"${member.join(".")}" is not defined.`, node );
            }
            return base;
        }

        const memberExpression = (node)=>{
            let name =node.property.name;
            if( node.object.type ==="MemberExpression" )
            {
                memberExpression( node.object );
            }else
            {
                let target = this.parser(node.object,scope,node)
                member.push( target );
                if( flag ){
                   base = check(target,base);
                }
                if( member.length===1 && base instanceof Module )
                {
                    isStatic = true;
                }
            }
            member.push( name );
            if( flag ){
                base = check(name,base);
            }
            return member;
        }

        memberExpression( node );
        if( flag )
        {
            this.setExpressionReference( base );
        }
        return this.makeMemberExpression( member );
    }

    ObjectExpression(node,scope, parent)
    {
        let hasSpread = false;
        const map = {};
        const expres = node.properties.map( (child)=>{
            if( child.type ==="SpreadElement" )
            {
                hasSpread = true;
                return [this.parser(child,scope,node)];
            }
            const key = child.key.value || child.key.name;
            const value = this.parser(child.value,scope,child);
            this.checkIdentifierStatement(child.value, scope);
            map[ key ] = this.getExpressionReference();
            return this.makeObjectKeyValue(key,value); 
        });
        this.setExpressionReference( new Expression("Object", map) );
        return this.makeObjectExpression(scope, expres, hasSpread);
    }

    setExpressionReference( ...types )
    {
        if( types.length == 1 ){
            this.expressionReference.push( types[0] );
        }else if(types.length > 1){
            this.expressionReference.push( new Union(...types) );
        }
    }

    getExpressionReference()
    {
        return this.expressionReference.pop();
    }

    ArrowFunctionExpression(node,scope,parent)
    {
        const fnScope = scope.getScopeByType("function");
        const has = fnScope.createThisRef();
        if( has )
        {
           const name = fnScope.getThisRef();
           fnScope.pushBefore( this.semicolon(
                scope,
                this.makeDeclarationVariable(
                    scope,
                    "const",
                    [this.makeAssign(name,this.makeThisExpression(),null,this.compilation.module.id)]
                )
            ));

            if( fnScope.parent instanceof ClassScope )
            {
                fnScope.define( name, scope.define("this") );
            }
        }
        return this.FunctionExpression(node,scope,parent,true,node.expression);
    }

    parserFunctionParams(scope,items,parent)
    {
        const params=[];
        items.forEach( (item)=>{
            let name = "";
            let type = null;
            let defaultValue = void 0;
            let declar = null;
            if( item.type === "AssignmentPattern" )
            {
                name = this.parser(item.left,scope,item);
                type = this.parser(item.left.acceptType,scope,item);
                defaultValue = item.right ? this.parser(item.right,scope,item) : defaultValue;
                declar = new Parameter(name, defaultValue, type);
                this.setAssignment(declar, this.getExpressionReference() );
                
            }else
            {
                name = this.parser(item,scope,parent);
                type = this.parser(item.acceptType,scope,parent);
                declar = new Parameter(name, defaultValue, type, item.type === "RestElement");
            }
            params.push( declar );
            scope.define(name, declar);
        });
        return params;
    }

    FunctionExpression(node,scope,parent,isArrow,isExpression)
    {
        scope = new FunctionScope( scope, !!node.static , isArrow );
        scope.isExpression = isExpression;
        let key = null;
        if( parent && parent.type ==="MethodDefinition" )
        {
            key = this.parser(parent.key,scope,node);
            if( !key && parent.kind === "constructor" )
            {
                key = "constructor";
            }

            if( !parent.static )
            {
               scope.define( "this", new Expression(this.module.id, this.module ) );
            }
        }

        const returnType = this.parser(node.returnType,scope,node);
        const params= this.parserFunctionParams(scope,node.params);
        let body  = this.parser(node.body,scope,node);
        scope.returnType=returnType;
        scope.params = params;
        if( isArrow && isExpression )
        {
            body = this.semicolon(scope.parent.parent, this.makeReturnStatement(scope,body) );
        }
        this.setExpressionReference( new Expression("Function",scope) );
        return this.makeFunctionExpression( scope.parent, body, key, params, returnType, isExpression );
    }

    ArrayExpression(node,scope, parent){

        let hasSpread = false;
        let map = [];
        const elements = node.elements.map( (item)=>{
            let value = this.parser(item,scope,node,true);
            map.push( this.getExpressionReference() );
            if( "SpreadElement" === item.type )
            {
                value = [value];
                hasSpread = true;
            }
            return value;
        });
        this.setExpressionReference( new Expression("Array",map) );
        return this.makeArrayExpression( scope, elements , hasSpread);
    }

    LogicalExpression(node,scope, parent)
    {
        const left =  this.parser(node.left,scope,node,true);
        const leftType = this.getExpressionReference();
        const right =  this.parser(node.right,scope,node,true);
        const rightType = this.getExpressionReference();
        this.setExpressionReference(leftType,rightType);
        return this.makeLogicalExpression(left,right,node.operator);
    }

    AssignmentExpression(node, scope, parent)
    {
        const left = this.parser( node.left, scope, node );
        const right = this.parser( node.right, scope, node , true);
        const declar = scope.define( left );
        if( declar )
        {
            this.setAssignment(declar, this.getExpressionReference() );
        }else{
            this.error( `"${left}" is not defined.`, node);
        }
        return this.makeAssignmentExpression(scope,left,right);
    }

    ThisExpression(node, scope, parent)
    {
        let fnScope = scope.getScopeByType("function");
        this.setExpressionReference( scope.define( fnScope.isArrow ? fnScope.getThisRef() : "this" ) );
        return this.makeThisExpression( scope );
    }

    BinaryExpression(node, scope, parent)
    {
         const left = this.parser(node.left,scope,node);
         const operator = node.operator;
         const right = this.parser(node.right,scope,node);
         this.setExpressionReference( new Type("Boolean") );
         this.makeBinaryExpression(left,right,operator);
    }

    CallExpression(node, scope, parent)
    {
        const target = this.parser(node.callee,scope,node,true);
        const desc   = this.getExpressionReference();
        const args = node.arguments.map( (item,index)=>{
           this.checkIdentifierStatement(item,scope)
           const val = this.parser(item,scope,node);
           const expreType = this.getExpressionReference();
           if( desc.params[index] )
           {
              this.compilation.checkType( desc.params[index], expreType);
           }
           return val;
        });

        if( !desc || !(desc.kind ==="method" || desc instanceof FunctionScope ) )
        {
            this.error(`"${target}" is not method`, node);
        }

        let returnExpre = desc.returnType;
        this.setExpressionReference( returnExpre );
        return this.makeCallExpression(target, args);
    }

    NewExpression(node, scope, parent)
    {
        const callee = this.parser(node.callee,scope,node);
        const typeModule = this.getExpressionReference();
        const args = node.arguments.map( (item)=>{
            return this.parser(item,scope,node);
        });
        this.setExpressionReference( new Expression(callee,typeModule) );
        return this.makeNewExpression(scope,callee,args);
    }

    RestElement(node, scope, parent)
    {
       this.makeRestElement(scope,node.argument.name);
       return node.argument.name;
    }

    SpreadElement(node, scope, parent)
    {
        return this.makeSpreadElement(scope, node.argument.name );
    }

    checkIdentifierStatement(node,scope)
    {
        if( node && node.type ==="Identifier" )
        {
            const name = node.name;
            if( !scope.isDefine( name ) )
            {
                this.error(`"${name}" is not defined.`, node);
            }
            return true;
        }
        return false;
    }

    ReturnStatement(node,scope, parent)
    {
        let expre = this.parser(node.argument,scope,node);
        const fnScope = scope.getScopeByType("function");
        fnScope.returnItems.push( this.getExpressionReference() );
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
        this.setExpressionReference( new Type("Number") );
        return this.makeUpdateExpression(target,operator,node.prefix);
    }

    UnaryExpression(node,scope, parent)
    {
        const operator = node.operator;
        const target = this.parser(node.argument, scope, node);
        this.setExpressionReference( new Type("Number") );
        return this.makeUnaryExpression(target,operator,node.prefix);
    }

    BlockStatement(node,scope,parent)
    {
        return node.body.map( (item)=>{
            return this.parser(item,newScope,node);
        }); 
    }

    IfStatement(node,scope,parent)
    {
        scope = new BlockScope( scope );
        const node = node;
        const condition  = this.parser(node.test,scope,node);
        const consequent = this.parser(node.consequent,scope,node);
        const alternate  = this.parser(node.alternate,scope,node);
        return  scope.add({node,condition,consequent,alternate});
    }

    WhileStatement(node,scope,parent)
    {
        scope = new BlockScope( scope );
        const condition = this.parser(node.test,scope,node);
        const body = this.parser(node.body,scope,node);
        return scope.add({node,condition,body});
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
        return scope.add({node,condition,cases});
    }

    SwitchCase(node,scope,parent)
    {
        const condition  = this.parser(node.test,scope,node);
        node.consequent.map( (item)=>{
            return this.parser(item,scope,node);
        });
        return scope.add({node,condition});
    }

    BreakStatement(node,scope,parent)
    {
        return scope.add({node});
    }

    ForStatement(node,scope,parent)
    {
        const init = this.parser(node.init,scope,node);
        const test = this.parser(node.test,scope,node);
        const update = this.parser(node.update,scope,node);
        this.parser(node.body,scope,node); 
        return scope.add({node,init,test,update});
    }

    ForInStatement(node,scope,parent)
    {
        const left = this.parser(node.left,scope,node);
        const right = this.parser(node.right,scope,node);
        this.parser(node.body,scope,node);
        return scope.add({node,left,right});
    }

    ForOfStatement(node,scope,parent)
    {
        const left = this.parser(node.left,scope,node);
        const right= this.parser(node.right,scope,node);
        this.parser(node.body,scope,node);
        return scope.add({node,left,right});
    }

    TryStatement(node,scope, parent)
    {
        const name = node.handler.param.name;
        const acceptType = this.parser( node.handler.param.acceptType, scope, node);
        const handler    = this.parser( node.handler.body, scope, node);
        this.parser( node.block, scope, node);
        return scope.add({node,name,acceptType,handler});
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
        this.compilation.module.addDepend( specifiers.split(".").pop(), specifiers );
    }

    VariableDeclaration(node,scope,parent)
    {
        const kind = node.kind;
        const declarations = node.declarations.map( (item)=>{
            return this.parser(item,scope,node);
        });

        switch( parent && parent.type )
        {
            case "ForStatement":
            case "ForInStatement":
            case "ForOfStatement":
                return new Declaration(node,kind,declarations,true);
        }

        return new Declaration(node,kind,declarations);
    }

    VariableDeclarator(node,scope,parent)
    {
        if( node.id && node.id.type ==="ArrayPattern" )
        {
            const initType = node.init.type;
            const initVlaue = this.parser(node.init,scope,node.id);
            return node.id.elements.map( (item,index)=>{
                const init =item.type === "AssignmentPattern" ? this.parser(item.right, scope, item) : null;
                const id =  item.type === "AssignmentPattern" ? item.left.name : item.name;
                const acceptType =  item.type === "AssignmentPattern" ? this.parser(item.left.acceptType,scope,item) : this.parser(item.acceptType,scope,item); 
                const declar = new Declarator(id, parent.kind, null, acceptType, init);
                scope.define(id, declar);
                if( initType==="ArrayExpression" ){
                    declar.initValue =  initVlaue.target[ index ] ? initVlaue.target[ index ].target : null;
                }else{
                    declar.initValue = `${initVlaue}[${index}]`;
                }
                return declar;
            });
           
        }else if( node.id && node.id.type ==="ObjectPattern" )
        {
            let initType = node.init.type;
            let initVlaue = this.parser( node.init, scope, node);
            return node.id.properties.map( (item,index)=>{
                const acceptType = this.parser(item.acceptType,scope, node.id);
                const id = item.key.name;
                const init = this.parser(item.value.right,scope, node.id);
                const declar = new Declarator(id, parent.kind, null, acceptType, init);
                scope.define(id, declar);
                if( initType==="ObjectExpression" ){
                    declar.initValue = initVlaue[id];
                }else{
                    declar.initValue = `${initVlaue}["${id}"]`;
                }
                this.checkProp(initVlaue,id,item);
                return declar;
            });
        }

        const id = node.id.name;  
        const acceptType = this.parser(node.id.acceptType,scope,node);
        const init       = this.parser(node.init,scope,node);
        const declar     = new Declarator(id,parent.kind, init, acceptType);
        scope.define(id, declar);
        return declar;
    }

    checkProp(target,prop,node)
    {
        if( target )
        {
            let obj = target;
            while( obj && obj.target )
            {
                obj =  obj.target;
            }

            if( !obj.hasOwnProperty(prop) )
            {
                 this.error(`${prop} is not defined`,node);
            }
        }
    }

    setAssignment(declar, value )
    {
        if( value )
        {
            declar.target = value;
        }
    }

    FunctionDeclaration(node,scope,parent)
    {
        const key = this.parser(node.id,scope,node);
        const fnScope = new FunctionScope(scope, false, false, true);
        fnScope.key = key;
        fnScope.define("this", new Type("Object") );
        fnScope.arguments = this.parserFunctionParams(fnScope,node.params);
        fnScope.returnType = this.parser( node.returnType, scope, node);
        this.parser(node.body,fnScope,node);
        scope.define(key,fnScope);
        return fnScope;
    }

    EnumDeclaration(node,scope,parent)
    {
        const id = node.name;
        const inherit = this.parser(node.extends,scope,node);
        const properties = {};
        let lastValue = 0;
        node.value.expressions.forEach( (item,index)=>{
            const key = item.left ? item.left.name : item.name;
            const value = item.right ? this.parser(item.right,scope,item) : new Expression(item,lastValue++,"Number");
            properties[ key ] = value;
            if( item.right && typeof item.right.value ==="number" )
            {
                lastValue = item.right.value+1;
            }
        });
        const obj = new Enum(node, properties, inherit);
        scope.define(id, obj);
        return obj;
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
        this.parser(node.superClass, scope, node, true);
        module.extends = this.getExpressionReference();
        (node.implements || []).forEach( (item)=>{
            this.parser(item,scope, node,true);
            module.implements.push( this.getExpressionReference() );
        });
        module.modifier = this.parser(node.modifier,scope,node);
        module.metatypes   = this.metatypes.splice(0,this.metatypes.length);
        module.annotations = this.annotations.splice(0,this.annotations.length);
        module.namespace.set(module.id, module);
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

    InterfaceDeclaration(node, scope, parent)
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
        module.namespace.set(module.id, module);
        const body= (node.body && node.body.body)||[];
        scope = new ClassScope(scope);
        (body).forEach( (item)=>{
            this.parser(item,scope,node);
        });
    }

    DeclaratorDeclaration(node, scope, parent)
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
        module.namespace.set(module.id, module);
        const body= (node.body && node.body.body)||[];
        scope = new ClassScope(scope);
        (body).forEach( (item)=>{
            
            this.parser(item,scope,node);
        });
        this.hasStruct = true;
    }


    PackageDeclaration(node,scope, parent)
    {
        const id = node.id ? this.parser(node.id,scope,node) : null;
        this.module.namespace = Namespace.create( id );
        this.enter( node.body, scope, node );
    }

    TypeDefinition( node,scope, parent)
    {
       const type = this.parser(node.value,scope,node);
       const desc = this.compilation.getType( type );
       return desc;
    }

    PropertyDefinition(node,scope, parent)
    {
        const modifier = this.parser(node.modifier, scope, node);
        const declar   = this.parser(node.declarations[0],scope,node)[0];
        const desc = new PropertyDescription(declar.key,declar.kind,declar.acceptType,!!node.static,modifier);
        desc.metatypes = this.metatypes.splice(0,this.metatypes.length);
        desc.annotations = this.annotations.splice(0,this.annotations.length);
        this.compilation.module.addMember(desc.key, desc);
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
            const metatypes = this.metatypes.splice(0,this.metatypes.length);
            const annotations = this.annotations.splice(0,this.annotations.length);
            const params = this.parserFunctionParams( scope, node.value.params );
            const isConstruct = kind ==="constructor" || module.id === key;
            const returnType = isConstruct ? module : this.parser(node.returnType, scope, node);
            const desc = new MethodDescription(key,kind,returnType,isStatic,modifier,params);
            desc.metatypes = metatypes;
            desc.annotations = annotations;
            if( isConstruct )
            {
                module.constructor = desc;
            }
            module.addMember(key, desc);

       }else
       {
            let desc = this.compilation.getDescribe( key, isStatic );
            desc.body = this.parser( node.value, scope, node);
            console.log( desc.body )
       }

    }

    Program(node, scope, parent)
    {
       return this.enter(node.body, scope, node);
    }

    Identifier(node, scope, parent)
    {
        const ref = scope.define( node.name ) || this.compilation.getType( node.name );
        if( !ref )
        {
            this.compilation.throwError(`"${node.name }" is not defined`, node.start )
        }
        return new Expression(node,node.name,ref);
    }

    Literal(node,scope,parent)
    {
        let type = "String";
        const value = node.raw || node.value;
        if( node.regex )
        {
            type= "RegEx";

        }else if(node.value == node.raw)
        {
            type= "Number";
        }else if( node.raw === "false" || node.raw === "true")
        {
            type = "Boolean";
        }
        return new Expression(node,value,type);
    }

    enter(body, scope, parent)
    {
        return body instanceof Array && body.map( (item)=>{
            return this.parser( item, scope, parent );
        }).join("");
    }


    parser(node,scope,parent=null,flag)
    {
        if( !node )
        {
            return null;
        }
        this.expressionReference.pop();
        return this[ node.type ](node,scope,parent,flag);
    }
}

module.exports = Grammar;