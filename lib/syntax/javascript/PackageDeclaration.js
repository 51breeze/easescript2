const Syntax = require("./Syntax");
class PackageDeclaration extends Syntax{
    emit(syntax){
        const module = this.compilation.module;
        const methods = module.methods;
        const members = module.members;
        const properties = [];
        const content = [];
        const emiterItem=(item,name,modifier)=>{
            const metaTypes = item.metatypes;
            const annotations = item.annotations;
            if( !this.checkMetaTypeSyntax(metaTypes) ){
                return null;
            }
            const value = item.isPropertyDefinition && item.init ? item.init.emit(syntax) : item.emit(syntax);
            if( value ){
                if( item.isPropertyDefinition ){
                    if( !item.static ){
                        properties.push(`"${name}":${value||null}`);
                        return null;
                    }
                    return value;
                }else{
                    return value;
                }
            }
            return null;
        }
        const emiter=(target,proto)=>{
            for( var name in target ){
                const item = target[ name ];
                const modifier = item.modifier ? item.modifier.value() : 'public';
                if( item.isPropertyDefinition && !item.static ){
                    emiterItem(item,name,modifier);
                    if( modifier !=="private" ){
                       const getter = `function get${name}(){\r\n\t\treturn this[private].${name};\r\n\t}`;
                       const setter = `function set${name}(value){\r\n\t\tthis[private].${name}=value;\r\n\t}`;
                       content.push(`\tObject.definProperty(${proto}, "${name}",{\r\n\tget:${getter},\r\n\tset:${setter}});`);
                    }
                }else if( item.isAccessor ){
                    const getter = item.get ? emiterItem(item.get,name,modifier) : null;
                    const setter = item.set ? emiterItem(item.set,name,modifier) : null;
                    content.push(`\tObject.definProperty(${proto}, "${name}",{\r\n\tget:${getter},\r\n\tset:${setter}});`);
                }else{
                    const value = emiterItem(item,name,modifier);
                    content.push(`\tObject.definProperty(${proto}, "${name}", {value:${value}});`);
                }
            }
        }
        emiter( methods , module.id);
        emiter( members , `${module.id}.prototype`);
        const parentClass =  module.extends.length > 0 ? module.extends[0].id : 'Object';
        const callSuper = module.extends.length > 0 ? `${module.extends[0].id}.call(this);` : '';
        if( properties.length > 0 ){
            module.methodConstructor.once("fetchClassProperty",(event)=>{
                event.properties = `{${properties.join(",")}}`;
            });
        }
        const construct = module.methodConstructor ? module.methodConstructor.emit( syntax ) : `function ${module.id}(){${callSuper}}`;
        const ns = module.namespace.getChain().join(".");
        const privatekey = properties.length > 0 ?  `\tvar private=Symbol("private");` : '';
        const code = [
            `(function(ns){`,
            privatekey,
            `\t${construct}`,
            `\tObject.definProperty(${module.id},"prototype",{value:Object.create(${parentClass}.prototype)});`,
            `\tObject.definProperty(${module.id}.prototype,"constructor",{value:${module.id}});`,
            content.join("\r\n"),
            `\tns.${module.id}=${module.id};`,
            `})(ns.${ns});`
        ];
        return code.filter( value=>!!value ).join("\r\n");
   }
}

module.exports = PackageDeclaration;