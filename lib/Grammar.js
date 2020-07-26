
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
    }

    memberExpression(node,scope, parent)
    {
        const member = [this.parser(node.object, scope, node), node.property.value || node.property.name ];
        return member.join(".");
    }

    objectExpression(node,scope, parent){
        const items=[];
        node.properties.forEach( (child)=>{
            const key = this.parser(child.key,scope,node);
            const value = this.parser(child.value,scope,node);
            items.push( `"${key}":${value}` );
        });
        return "{"+items.join(",")+"}";
    }

    arrowFunctionExpression(node,scope,parent)
    {
        scope = new FunctionScope( scope, !!node.static );
        const params=[];
        node.params.forEach( (item)=>{
            params.push({});
        });
        node.body.body.forEach( (item)=>{
            this.parser(item,scope,node);
        });
        return `function(){}`;
    }

    functionExpression(node, scope, parent)
    {
        scope = new FunctionScope( scope, !!node.static );
        const params=[];
        node.params.forEach( (item)=>{
            params.push({});
        });

        node.body.body.forEach( (item)=>{
            this.parser(item,scope,node);
        });
        return `function(){}`;
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
        return "this";
    }

    binaryExpression(node, scope, parent)
    {
         const left = this.parser(node.left,scope,node);
         const operator = node.operator;
         const right = this.parser(node.right,scope,node);
         return `${left} ${operator} ${right}`;
    }

    expressionStatement(node,scope, parent)
    {
        const expression = this.parser(node.expression,scope,node);
        if( expression )
        {
            scope.push( expression+";\r\n");
        }
    }

    blockStatement(node,scope,parent)
    {
        scope = new BlockScope( scope );
        node.body.forEach( (item)=>{
            this.parser(item,scope,node);
        });
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

        if( consequent )
        {
            node.consequent.body.forEach( (item)=>{
                this.parser(item,scope,node.consequent);
            });

        }else if( node.alternate )
        {
            node.alternate.body.forEach( (item)=>{
                this.parser(item,scope,node.alternate);
            });
        }

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

    variableDeclaration(node,scope, parent)
    {
        const kind = node.kind;
        const declarations = []
        node.declarations.forEach( (item)=>{
            const declars = this.parser(item,scope,node);
            declars.forEach( (declar)=>{
                if( declar.init === null ){
                    declarations.push( declar.id ); 
                }else{
                    if( declar.defaultValue ){
                        declarations.push( `${declar.id} = ${declar.init} || ${declar.defaultValue}` );  
                    }else{
                        declarations.push( `${declar.id} = ${declar.init}` );  
                    }
                }
            });
        });
        scope.push( `${kind} `+declarations.join(",")+";\n" );
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
            properties.push( `"${key}":${value}` )
        });
        scope.define(id,"Object");
        if( inherit ){
            scope.push( `var ${id} = Object.assign(${inherit},{${properties.join(",")}});\r\n` );
        }else{
           scope.push( `var ${id} = {${properties.join(",")}};\r\n` );
        }
    }

    modifierDeclaration(node, scope,parent)
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
        this.parser( node.value, scope, parent);
    }

    program(node, scope, parent)
    {
        this.enter(node.body, scope, node);

        console.log( this.scope.toString() )
    }

    enter(body, scope, parent)
    {
        body instanceof Array && body.forEach( (item)=>{
            this.parser( item, scope, parent );
        });
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

        switch( node.type )
        {
            case "Program" :
                return this.program(node,scope,parent);
            case "PackageDeclaration":
                return this.packageDeclaration(node,scope,parent);
            case "MemberExpression":
                return this.memberExpression(node,scope,parent);
            case "ImportDeclaration":
                return this.importDeclaration(node,scope,parent);
            case "ClassDeclaration":
                return this.classDeclaration(node,scope,parent);
            case "MethodDefinition":
                return this.methodDefinition(node,scope,parent);
            case "PropertyDefinition":
                return this.propertyDefinition(node,scope,parent);
            case "AnnotationDeclaration":
                return this.annotationDeclaration(node,scope,parent);
            case "MetatypeDeclaration":
                return this.metatypeDeclaration(node,scope,parent);
            case "VariableDeclaration":
                return this.variableDeclaration(node,scope,parent);
            case "VariableDeclarator":
                return this.variableDeclarator(node,scope,parent);
            case "ExpressionStatement":
                return this.expressionStatement(node,scope,parent);
            case "TypeDefinition":
                return this.typeDefinition(node,scope,parent);
            case "Identifier":
                return this.identifier(node,scope,parent);
            case "ModifierDeclaration":
                return this.modifierDeclaration(node,scope,parent);
            case "Literal":
                return this.literal(node,scope,parent);
            case "AssignmentExpression":
                return this.assignmentExpression(node,scope,parent);
            case "FunctionExpression":
                return this.functionExpression(node,scope,parent);
            case "ObjectExpression":
                return this.objectExpression(node,scope,parent);
            case "LogicalExpression":
                return this.logicalExpression(node,scope,parent);
            case "ArrowFunctionExpression":
                return this.arrowFunctionExpression(node,scope,parent);
            case "ArrayExpression":
                return this.arrayExpression(node,scope,parent);
            case "BinaryExpression":
                return this.binaryExpression(node,scope,parent);
            case "EnumDeclaration":
                return this.enumDeclaration(node,scope,parent);
        }
    }
}

module.exports = Grammar;