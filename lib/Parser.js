const acorn = require("acorn");
const
    SCOPE_TOP = 1,
    SCOPE_FUNCTION = 2,
    SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION,
    SCOPE_ASYNC = 4,
    SCOPE_GENERATOR = 8,
    SCOPE_ARROW = 16,
    SCOPE_SIMPLE_CATCH = 32,
    SCOPE_SUPER = 64,
    SCOPE_DIRECT_SUPER = 128;

 const
    BIND_NONE = 0, 
    BIND_VAR = 1, 
    BIND_LEXICAL = 2,
    BIND_FUNCTION = 3, 
    BIND_SIMPLE_CATCH = 4,
    BIND_OUTSIDE = 5;

const Parser = acorn.Parser
const TokenType = Parser.acorn.TokenType;
const tokTypes = Parser.acorn.tokTypes;
const keywordTypes = Parser.acorn.keywordTypes;

keywordTypes["is"] = new TokenType("is", {beforeExpr: true, binop: 7});
tokTypes._is = keywordTypes["is"];

keywordTypes["package"] = new TokenType("package",{startsExpr: true});
tokTypes._package = keywordTypes["package"];

keywordTypes["implements"] = new TokenType("implements",{startsExpr: true});
tokTypes._implements = keywordTypes["implements"];

keywordTypes["private"] = new TokenType("private",{startsExpr: true});
tokTypes._private = keywordTypes["private"];

keywordTypes["protected"] = new TokenType("protected",{startsExpr: true});
tokTypes._protected = keywordTypes["protected"];

keywordTypes["public"] = new TokenType("public",{startsExpr: true});
tokTypes._public = keywordTypes["public"];

keywordTypes["static"] = new TokenType("static",{startsExpr: true});
tokTypes._static = keywordTypes["static"];

keywordTypes["when"] = new TokenType("when");
tokTypes._when = keywordTypes["when"];

keywordTypes["then"] = new TokenType("then",{startsExpr: true});
tokTypes._then = keywordTypes["then"];

keywordTypes["enum"] = new TokenType("enum",{startsExpr: true});
tokTypes._enum = keywordTypes["enum"];

keywordTypes["interface"] = new TokenType("interface",{startsExpr: true});
tokTypes._interface = keywordTypes["interface"];

keywordTypes["abstract"] = new TokenType("abstract",{startsExpr: true});
tokTypes._abstract = keywordTypes["abstract"];

tokTypes._declarator = new TokenType("declarator",{startsExpr: true});

tokTypes._annotation = new TokenType("@",{startsExpr: true});
tokTypes._shortTernary = new TokenType("?:",{startsExpr: true,binop:1});

class SyntaxParser extends Parser {

    constructor(options, input, startPos)
    {
        super(options, input, startPos);
        this.keywords =  new RegExp( this.keywords.source.replace(")$","|is|package|implements|static|public|protected|private|when|then|enum|interface|abstract)$") );
    }

    declareName(name, bindingType, pos)
    {
        if( bindingType === BIND_VAR )
        {
           const scope = this.currentVarScope();
           if( scope.var.indexOf(name) >= 0 ) 
           {
               this.raiseRecoverable(pos, ("Identifier '" + name + "' has already been declared"));
           }
        }

        super.declareName( name, bindingType, pos);
    }

    parseStatement(context, topLevel, exports, isStatic)
    {
        switch ( this.type )
        {
            case tokTypes._package : 
                if( !topLevel )
                {
                    this.unexpected();
                }
                return this.parsePackage( this.startNode(), true );
            break;
            case tokTypes._abstract : 
                if( !topLevel || isStatic )
                {
                    this.unexpected();
                }

                var abstract = this.startNode();
                abstract.name = "abstract";
                this.next();

                if( this.type !== tokTypes._class )
                {
                    this.unexpected();
                }

                this.finishNode(abstract,"ModifierDeclaration")
                var node = this.parseClass(this.startNode(), true, true );
                node.abstract = abstract;
                return node;
                
            break;
            case tokTypes._public : 
                if( !topLevel )
                {
                    this.unexpected();
                }

                this.next();
                var modifier = this.finishNode(this.startNode(),"ModifierDeclaration");
                modifier.name = "public";
                var node = this.parseStatement(null, topLevel, exports);
                node.modifier = modifier;
                return node;
               
            break;

            case tokTypes._protected : 
                if( !topLevel )
                {
                    this.unexpected();
                }

                this.next();
                var modifier = this.finishNode(this.startNode(),"ModifierDeclaration");
                modifier.name = "protected";
                var node = this.parseStatement(null, topLevel, exports);
                node.modifier = modifier;
                return node;
               
            break;

            case tokTypes._private : 
            
                this.raise( this.lastTokStart, `Private modifier can only be used in class member methods`);

            break;

            case tokTypes._static:
                
                if( !topLevel )
                {
                    this.unexpected();
                }

                this.next();

                var modifier = this.finishNode(this.startNode(),"ModifierDeclaration");
                modifier.name = "static";
                var node = tokTypes._class === this.type ? this.parseClass(this.startNode(), true, false, true ) : this.parseStatement(null, topLevel, exports, true);
                node.static = modifier;
                return node;
                
            case tokTypes._import:
                if( !topLevel )
                {
                    this.unexpected();
                }
                return this.parseImport( this.startNode() );
            case tokTypes._when:
                return this.parseWhenStatement( this.startNode() );

            case tokTypes._enum:
                return this.parseEnumStatement( this.startNode(), topLevel );

            case tokTypes._interface:
                if( !topLevel ) { this.unexpected(); }
                return this.parseInterface( this.startNode(), topLevel );
            default:
        }

        if( topLevel && this.value ==="declarator" )
        {
            return this.parseDeclarator( this.startNode(), topLevel );
        }

        return super.parseStatement(context, topLevel, exports);
    }

    parseExprAtom(refDestructuringErrors) 
    {
        var intersection = null;
        switch ( this.type ) 
        {
           case tokTypes.relational :

             if(this.value.length ===1 && this.value.charCodeAt(0) === 60 )
             {
                 this.next();
                 intersection = this.parseTypeStatement();
                 if( this.type===tokTypes.relational && this.value.charCodeAt(0) === 62)
                 {
                    this.next();
                 }else{
                     this.unexpected();
                 }
             }

            break;

            case tokTypes._enum :
                return this.parseEnumStatement( this.startNode(), false );

        }
        const node = super.parseExprAtom(refDestructuringErrors);
        if( node && intersection)
        {
            node.acceptType = intersection;
        }
        return node;
    }

    parseMaybeConditional(noIn, refDestructuringErrors)
    {
        if( this.type === tokTypes._enum )
        {
            this.raise(this.lastTokEnd, "Enum expression is not assignable");
        }
        return super.parseMaybeConditional(noIn, refDestructuringErrors);
    }

    parseWhenStatement(node) 
    {
        const currentScope = this.currentScope();
        const inherit = (scope, inherit)=>{
            scope.var = scope.var.concat( inherit.var );
            scope.lexical = scope.lexical.concat( inherit.lexical );
            scope.functions = scope.functions.concat( inherit.functions );
        };

        this.next();
        node.test = this.parseParenExpression();
        this.enterScope( SCOPE_FUNCTION );
        const whenScope = this.currentScope()
        inherit( whenScope, currentScope);
        node.consequent = super.parseStatement("when");
        this.exitScope();

        this.enterScope( SCOPE_FUNCTION );
        const thenScope = this.currentScope()
        inherit(thenScope, currentScope);
        node.alternate = this.eat(tokTypes._then) ? super.parseStatement("then") : null;
        this.exitScope();

        inherit(currentScope, whenScope);
        inherit(currentScope, thenScope);
        return this.finishNode(node, "WhenStatement");
    }

    parseEnumStatement(node) 
    {
        this.next();
        if (this.type === tokTypes.name)
        {
            node.name = this.value;
        } else {
            this.unexpected();
        }

        this.next();
        if( this.type === tokTypes._extends  )
        {
            this.next();
            node.extends = this.parseChainIdentifier();
        }

        this.expect( tokTypes.braceL );
        node.value = this.parseExpression();
        this.expect( tokTypes.braceR );
        return this.finishNode(node, "EnumDeclaration")
    }

    parseInterfaceMethod(element, isGenerator, isAsync) 
    {
        var node = this.startNode();
        node.async = !!isAsync;
        this.expect(tokTypes.parenL);
        node.params = this.parseBindingList(tokTypes.parenR, false, true);
        this.finishNode(element, "MethodDefinition");
        return node;
    }

    parseInterfaceElement()
    {
        if (this.eat(tokTypes.semi))
        {
             return null
        }

        const modifier = this.parseModifier();
        const isProperty = this.type === tokTypes._const || this.type === tokTypes._var;
        const element = isProperty ? this.parseVarStatement( this.startNode(), this.value ) : this.startNode();
        if( !isProperty )
        {
            var tryContextual = (k, noLineBreak)=>{

                if ( noLineBreak === void 0 ) noLineBreak = false;
                var start = this.start, startLoc = this.startLoc;
                if (!this.eatContextual(k)) { return false }
                if (this.type !== tokTypes.parenL && (!noLineBreak || !this.canInsertSemicolon())) { return true }
                if (element.key) { this.unexpected(); }
                element.computed = false;
                element.key = this.startNodeAt(start, startLoc);
                element.key.name = k;
                this.finishNode(element.key, "Identifier");
                return false
            };
        
            const isGenerator = this.eat(tokTypes.star);
            element.kind    = "method";
            element.isAsync = tryContextual("async", true);
            element.isGenerator = isGenerator;

            if (tryContextual("get")) {
                element.kind = "get";
            } else if (tryContextual("set")) {
                element.kind = "set";
            }

            if (!element.key)
            { 
                this.parsePropertyName(element);
            }
        
            var key = element.key;
            if ( key.name === "constructor" )
            {
                this.raise(key.start, "Interface can't have Constructor");

            } else if( key.name === "prototype" ) 
            {
                this.raise(key.start, "Interface may not have a property named prototype");
            }
            element.value = this.parseInterfaceMethod(element, isGenerator, element.isAsync, false);
            if (element.kind === "get" && element.value.params.length !== 0)
                { this.raiseRecoverable(element.value.start, "getter should have no params"); }
            if (element.kind === "set" && element.value.params.length !== 1)
                { this.raiseRecoverable(element.value.start, "setter should have exactly one param"); }
            if (element.kind === "set" && element.value.params[0].type === "RestElement")
                { this.raiseRecoverable(element.value.params[0].start, "Setter cannot use rest params"); }

            if( this.eat( tokTypes.colon ) )
            {
                element.returnType = this.parseTypeStatement();
            }

        }else{

            if( element.declarations.length > 1 )
            {
                this.raise( element.start , `Interface member properties can only be declared one at a time.`)
            }
            if(  element.declarations[0].init )
            {
                this.raise( element.start , `Interface member properties cannot be have initial value.`)
            }
            this.finishNode(element, "PropertyDefinition");
        }

        if ( modifier[0] )
        {
            element.modifier =  modifier[0];
            if( element.modifier.name !=="public" )
            {
                this.raise( modifier[0].start , `Interface member can only be "public" modifier.`)
            }
        }

        if( modifier[1] )
        {
            this.raise( modifier[1].start, `Interface member cannot use "static" modifier `)
        }
        return element;
    }

    parseInterface(node) {

        this.next();
        var oldStrict = this.strict;
        this.strict = true;
        this.parseClassId(node, true);

        if( this.type === tokTypes._extends  )
        {
            this.next();
            node.extends = this.parseChainIdentifier();
        }

        var classBody = this.startNode();
        classBody.body = [];
        this.expect(tokTypes.braceL);

        while (this.type !== tokTypes.braceR) 
        {
          var element = this.parseInterfaceElement();
          if (element) {
            classBody.body.push(element);
          }
        }
        this.strict = oldStrict;
        this.next();
        node.body = this.finishNode(classBody, "InterfaceBody");
        return this.finishNode(node,  "InterfaceDeclaration")
    }


    parseDeclarator(node)
    {
        this.next();
        var oldStrict = this.strict;
        this.strict = true;
        this.parseClassId(node, true);

        if( this.type === tokTypes._extends  )
        {
            this.next();
            node.extends = this.parseChainIdentifier();
        }

        var classBody = this.startNode();
        classBody.body = [];
        this.expect(tokTypes.braceL);

        while (this.type !== tokTypes.braceR) 
        {
          var element = this.parseDeclaratorElement();
          if (element) {
            classBody.body.push(element);
          }
        }
        this.strict = oldStrict;
        this.next();
        node.body = this.finishNode(classBody, "DeclaratorBody");
        return this.finishNode(node,  "DeclaratorDeclaration")
    }

    parseDeclaratorElement()
    {
        if (this.eat(tokTypes.semi))
        {
             return null
        }

        const modifier = this.parseModifier();
        const isProperty = this.type === tokTypes._const || this.type === tokTypes._var;
        const element = isProperty ? this.parseVarStatement( this.startNode(), this.value ) : this.startNode();
        if( !isProperty )
        {
            var tryContextual = (k, noLineBreak)=>{

                if ( noLineBreak === void 0 ) noLineBreak = false;
                var start = this.start, startLoc = this.startLoc;
                if (!this.eatContextual(k)) { return false }
                if (this.type !== tokTypes.parenL && (!noLineBreak || !this.canInsertSemicolon())) { return true }
                if (element.key) { this.unexpected(); }
                element.computed = false;
                element.key = this.startNodeAt(start, startLoc);
                element.key.name = k;
                this.finishNode(element.key, "Identifier");
                return false
            };
        
            const isGenerator = this.eat(tokTypes.star);
            element.kind    = "method";
            element.isAsync = tryContextual("async", true);
            element.isGenerator = isGenerator;

            if (tryContextual("get")) {
                element.kind = "get";
            } else if (tryContextual("set")) {
                element.kind = "set";
            }

            if (!element.key)
            { 
                this.parsePropertyName(element);
            }
        
            var key = element.key;
            if( key.name === "prototype" )
            {
                this.raise(key.start, "Declarator may not have a property named prototype");
            }
            element.value = this.parseInterfaceMethod(element, isGenerator,  element.isAsync, false);
            if (element.kind === "get" && element.value.params.length !== 0)
                { this.raiseRecoverable(element.value.start, "getter should have no params"); }
            if (element.kind === "set" && element.value.params.length !== 1)
                { this.raiseRecoverable(element.value.start, "setter should have exactly one param"); }
            if (element.kind === "set" && element.value.params[0].type === "RestElement")
                { this.raiseRecoverable(element.value.params[0].start, "Setter cannot use rest params"); }

            if( this.eat( tokTypes.colon ) )
            {
                element.returnType = this.parseTypeStatement();
            }

        }else{

            if( element.declarations.length > 1 )
            {
                this.raise( element.start , `Declarator member properties can only be declared one at a time.`)
            }
            if( element.declarations[0].init )
            {
                this.raise( element.start , `Declarator member properties cannot be have initial value.`)
            }
            this.finishNode(element, "PropertyDefinition");
        }

        if ( modifier[0] )
        {
            element.modifier =  modifier[0];
        }

        if ( modifier[1] )
        {
            element.static =  modifier[1];
        }

        return element;
    }

    readToken( code )
    {
        //?:
        if( code===63 && this.input.charCodeAt(this.pos+1)===58)
        {
            this.pos+=2; 
            return this.finishToken(tokTypes._shortTernary);
        }

        //@
       if( code === 64 )
       {
          ++this.pos; 
          return this.finishToken(tokTypes._annotation);
       } 
       return super.readToken(code);
    }

    parseExprOp(left, leftStartPos, leftStartLoc, minPrec, noIn) 
    {
        var prec = this.type.binop;
        if (prec != null && (!noIn || this.type !== types._in)) 
        {
            if (prec > minPrec && this.type === tokTypes._shortTernary ) 
            {
                var op = this.value;
                this.next();
                var startPos = this.start, startLoc = this.startLoc;
                var right = this.parseExprOp( this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn);
                var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, true);
                return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn)
            }
        }
        return super.parseExprOp(left, leftStartPos, leftStartLoc, minPrec, noIn);
    }

    parseClassSuper(node)
    {
        node.superClass = null;
        if(  this.eat(tokTypes._extends) )
        {
            if( this.isStaticClass )
            {
                this.raise(this.lastTokStart,"Static class cannot extends super class.");
            }
            node.superClass = this.parseChainIdentifier();
        }
        
        node.implements = null;
        if( this.eat(tokTypes._implements) )
        {
            if( this.isStaticClass )
            {
                this.raise(this.lastTokStart,"Static class cannot implements interfaces.");
            }

            node.implements = [];
            do{ 
                node.implements.push( this.parseChainIdentifier() );
            }while( this.eat(tokTypes.comma) );
        }
    }

    parseClassId(node, isStatement)
    {
        super.parseClassId(node, isStatement);
        this.currentClassId = node.id;
    }

    parseGenericType()
    {
        switch ( this.type ) 
        {
           case tokTypes.relational :

            if(this.value.length ===1 && this.value.charCodeAt(0) === 60 )
            {
                 this.next();
                 const genericType = [];
                 do{
                    genericType.push( this.parseTypeStatement() );
                 }while( this.eat(tokTypes.comma) );

                 if( this.type===tokTypes.relational && this.value.charCodeAt(0) === 62)
                 {
                    this.next();
                 }else{
                     this.unexpected();
                 }
                 return genericType;
            }
            break;
        }
        return false;
    }

    parseChainIdentifier()
    {
        const startPos = this.start, startLoc = this.startLoc;
        const type = this.type;
        var base = super.parseIdent( type === tokTypes._void );
        this.checkLVal(base, BIND_NONE);
        while ( this.eat( tokTypes.dot ) ) 
        {
            const node = this.startNodeAt(startPos, startLoc);
            node.object = base;
            node.property = this.parseIdent( this.options.allowReserved !== "never" );
            base = this.finishNode(node, "MemberExpression");
        }
        return base;
    }

    parseTypeStatement()
    {
        const node = this.startNode();
        let  typeName = "TypeDefinition";
       
        if( (this.type === tokTypes.name || this.type  === tokTypes._void) && this.type !== tokTypes.eof )
        {
            node.value = this.parseChainIdentifier();
            if( this.type === tokTypes.relational && this.value.charCodeAt(0) === 60 && this.value.length===1 )
            {
                this.next();
                const elements = [];
                while( !( this.type === tokTypes.relational && this.value.charCodeAt(0) === 62 && this.value.length===1 ) )
                {
                    elements.push( this.parseTypeStatement() );
                    if( !this.eat(tokTypes.comma) )
                    {
                        break;
                    }
                } 
                this.next();
                node.value.typeElements = elements;

            }else if( this.type === tokTypes.bracketL )
            {
                this.next();
                if( this.type !== tokTypes.bracketR )
                {
                    this.unexpected(); 
                }else{
                    this.next();
                }
                node.isArrayElement = true;
            }

        }else
        {
            this.unexpected();
        }

        return this.finishNode(node, typeName );
    }

    parseBlock(createNewLexicalScope, node)
    {
        if ( createNewLexicalScope === void 0 )
        {
            createNewLexicalScope = true;
        } 

        if ( node === void 0 ) 
        {
            node = this.startNode();
        }

        const scope = this.currentScope();
        switch( scope.flags & SCOPE_FUNCTION )
        {
            case SCOPE_ARROW :
            case SCOPE_FUNCTION :
            case SCOPE_ASYNC :
            case SCOPE_GENERATOR :
                if( this.eat( tokTypes.colon ) )
                {
                   node.acceptType = this.parseTypeStatement();
                }
                break;
        }
        return super.parseBlock(createNewLexicalScope, node);
    }

    parseIdent(liberal, isBinding)
    {
        const node = super.parseIdent(liberal, isBinding);
        if( !liberal && this.eat( tokTypes.colon ) )
        {
            node.acceptType =  this.parseTypeStatement();
        }

        return node;
    }

    parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc)
    {
       if( isPattern && this.eat( tokTypes.colon )  )
       {
           prop.acceptType = this.parseTypeStatement();
       }
       super.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
    }

    parseRestBinding()
    {
        const node = super.parseRestBinding();
        if( node.argument && node.argument.acceptType )
        {
           const acceptType = node.argument.acceptType 
           if( acceptType.value.name.toLowerCase() !== "array" && !acceptType.isArrayElement )
           {
              this.raise(acceptType.value.start,"Rest type can only be array elements.")
           }
        }
        return node;
    }

    parseAnnotation()
    {
        this.next();
        const node = this.startNode();
        node.name = this.value;
        this.next();
        if( this.eat( tokTypes.parenL )  )
        {
            node.body = [];
            while( this.type !== tokTypes.parenR )
            {
                const elem = this.startNode();
                elem.name = this.value;

                this.next();
                if( this.eat(tokTypes.eq) )
                {
                    elem.value = this.parseMaybeAssign();
                }
                node.body.push( elem )
                this.finishNode(elem, "AssignmentExpression");

                if( !this.eat(tokTypes.comma) )
                {
                    break;
                }
            }
            this.expect( tokTypes.parenR );
        }
        return this.finishNode(node, "AnnotationDeclaration");
    }

    parseMetatype()
    {
        const node = this.startNode();
        node.name = this.value;
        this.next();
        if( this.eat( tokTypes.parenL )  )
        {
            node.body = [];
            while( this.type !== tokTypes.parenR )
            {
                const elem = this.startNode();
                elem.name = this.value;

                this.next();
                if( this.eat(tokTypes.eq) )
                {
                    elem.value = this.parseMaybeAssign();
                }
                node.body.push( elem )
                this.finishNode(elem, "AssignmentExpression");

                if( !this.eat(tokTypes.comma) )
                {
                    break;
                }
            }
            this.expect( tokTypes.parenR );
        }
        this.expect( tokTypes.bracketR );
        return this.finishNode(node, "MetatypeDeclaration");
    }

    parseModifier()
    {
        let staticNode = this.parseMethodStatic();
        let modifier = this.startNode();
        modifier.name = "public";
        for(let name of ["public","protected","private"] )
        {
            if( this.eat( tokTypes[ "_"+name ] ) )
            {
                modifier.name = name;
                break;
            }
        }
        this.finishNode(modifier, "ModifierDeclaration");
        if( !staticNode )
        {
            staticNode = this.parseMethodStatic();
        }
        return [modifier,staticNode];
    }

    parseMethodStatic()
    {
        let staticNode = null;
        if( this.eat(tokTypes._static) )
        {
            staticNode = this.startNode();
            staticNode.name = "static";
            this.finishNode(staticNode, "ModifierDeclaration");
        }
        return staticNode;
    }

    parseClassProperty(node,kind)
    {
        node = this.parseVarStatement( node, this.value );
        if( node.declarations.length > 1)
        {
            this.raise( node.start, `Only one class property member can be defined in a declaration`);
        } 
        return this.finishNode(node, "PropertyDefinition");        
    }

    parseClass(node, isStatement, isAbstract,isStatic )
    {
        this.isAbstractClass = isAbstract;
        this.isStaticClass   = isStatic;
        node = super.parseClass(node, isStatement);
        this.isAbstractClass = false;
        this.isStaticClass   = false;
        this.currentClassId = null;
        this.hasConstructor = false;
        return node;
    }

    parseClassElement( constructorAllowsSuper )
    {
        if( this.eat( tokTypes.bracketL ) )
        {
            return this.parseMetatype();
        }

        if( this.type === tokTypes._annotation )
        {
            return this.parseAnnotation();
        }

        const modifier = this.parseModifier();
        const isProperty = this.type === tokTypes._const || this.type === tokTypes._var;
        const element = isProperty ? this.parseClassProperty( this.startNode(), this.value ) : super.parseClassElement( constructorAllowsSuper );
        const isConstruct = !isProperty && element && ( (element.key && element.key.name.toLowerCase()==="constructor") || 
                                        (this.currentClassId && this.currentClassId.name === element.key.name)
                                    );

        if( this.isAbstractClass && isConstruct )
        {
            this.raise( element.start, `Abstract class cannot defined constructor.`);
        }   
        
        if( this.isStaticClass && isConstruct )
        {
            this.raise( element.start, `Static class cannot defined constructor.`);
        }

        if( isConstruct )
        {
            if( this.hasConstructor )
            {
                this.raise( this.lastTokStart, `Constructor has already been defined.`);
            }

            this.hasConstructor = true;
        }
        
        if ( modifier[0] )
        {
            element.modifier =  modifier[0];
            if( element.modifier.name !=="public" && isConstruct )
            {
                this.raise( element.key.start, `Constructor modifier can only be "public".`)
            }
        }

        if( modifier[1] )
        {
            element.static =  modifier[1];
            if( isConstruct )
            {
                this.raise( element.key.start, `Constructor cannot is static method.`)
            }
        }

        return element;
    }

    parseImport(node)
    {
        this.next();
        if( this.type !== tokTypes.name )
        {
            this.unexpected();
        }
        node.specifiers= this.parseStatement("import");
        this.finishNode(node.specifiers, "ImportSpecifier");
        return this.finishNode(node, "ImportDeclaration");
    }

    parseExport()
    {
        this.raise( this.lastTokStart, `Class do not need to use an export.`);
    }

    parsePackage(node, isStatement)
    {
        this.next();

        if( this.hasPackage )
        {
            this.raise( this.lastTokStart, `Package has already been defined.`);
        }

        var oldStrict = this.strict;
        this.strict = true;
        this.hasPackage = true;
        this.declarator = false;
        node.body = [];
        node.id = null;

        if( this.type === tokTypes.semi )
        {
            this.next();

        }else if(  tokTypes.braceL !== this.type )
        {
            node.id = this.parseChainIdentifier();
        }

        const metatype = ()=>{

            if( this.eat( tokTypes.bracketL ) )
            {
                return this.parseMetatype();
            }
    
            if( this.type === tokTypes._annotation )
            {
                return this.parseAnnotation();
            }
            return null;
        }

        if( this.eat(tokTypes.braceL) )
        {
            while( !this.eat(tokTypes.braceR) )
            {
                const item = metatype();
                if( item )
                {
                   node.body.push(item);
                }
                var element = this.parseStatement(null,true);
                node.body.push(element);
            }

        }else
        {
            while( tokTypes.eof !== this.type )
            {
                const item = metatype();
                if( item ){
                    node.body.push(item);
                }
                var element = this.parseStatement(null,true);
                node.body.push(element);
            }
        }

        this.strict = oldStrict;
        return this.finishNode(node,  "PackageDeclaration")
    }

    eat( type )
    {
       if( tokTypes.arrow === type)
       {
           if( super.eat( tokTypes.colon ) )
           {
                this.arrowReturnType = this.arrowReturnType || {};
                const type = this.parseTypeStatement();
                this.arrowReturnType[ this.lastTokEnd ] = type;
           }
       }
       return super.eat( type );
    }

    parseArrowExpression(node, params, isAsync)
    {
        let type = null;
        if( this.arrowReturnType && this.arrowReturnType[ this.lastTokStart ] )
        {
            type = this.arrowReturnType[  this.lastTokStart ];
            delete this.arrowReturnType[ this.lastTokStart ];
        }

        const fn = super.parseArrowExpression( node, params, isAsync );
        fn.returnType = type;
        return fn;
    }

    parseFunctionBody(node, isArrowFunction, isMethod)
    {
        if( !isArrowFunction && this.type === tokTypes.colon )
        {
            this.next();
            node.returnType = this.parseTypeStatement();
        }
        super.parseFunctionBody(node, isArrowFunction, isMethod);
    }

}

Parser.extend(function(){
    return SyntaxParser;
});

SyntaxParser.parse = function parse (input, options) {
    return new SyntaxParser(options, input).parse()
};

SyntaxParser.parseExpressionAt = function parseExpressionAt (input, pos, options) {
    var parser = new SyntaxParser(options, input, pos);
    parser.nextToken();
    return parser.parseExpression()
};

module.exports= {
    acorn,
    Parser:SyntaxParser
}