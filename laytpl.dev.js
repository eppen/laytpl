/**
 
 @Name : laytpl v1.1 - 精妙的JavaScript模板引擎
 @Author: 贤心
 @Date: 2014-08-16
 @Site：http://sentsin.com/layui/laytpl
 @License：MIT license
 
 */

;!function(win){
"use strict";

var config = {
    open: '{{',
    close: '}}'
};

var tool = {
    exp: function(str){
        return new RegExp(str, 'g');
    },
    //匹配满足规则内容
    query: function(type, _, __){
        var types = [
            '#([^])*?',   //js语句
            '#|',   //语句开合
            '([^{#}])*?' //普通字段
        ][type || 0];
        return tool.exp((_||'') + config.open + types + config.close + (__||''));
    },   
    escape: function(html){
        return String(html||'').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    },
    error: function(e, tplog){
        var error = 'Laytpl Error：';
        typeof console === 'object' && console.error(error + e + '\n'+ (tplog || ''));
        return error + e;
    }
};

var Tpl = function(tpl){
    this.tpl = tpl;
};

Tpl.pt = Tpl.prototype;

//核心引擎
Tpl.pt.parse = function(tpl, data){
    var that = this, tplog = tpl;

    tpl = tpl.replace(/\n|\t|\r/g, '').replace(/(?=\"|\')/g, '\\').replace(tool.query(), function(str){
        str = str.replace(/\\"|\\'/g, '"');
        return '";' + str.replace(tool.query(1, '^', '$'), '') + '; view+="';
    }).replace(tool.query(2), function(str){
        if(str.replace(/\s/g, '') === config.open+config.close){
            return '';
        }
        var sexp = '^'+config.open, start = '(';
        if(tool.exp(sexp+'=').test(str)){
            sexp += '=';
            start = '_escape_('
        }
        str = str.replace(tool.exp(sexp), '"+' + start).replace(tool.exp(config.close + '$'), ')+"');
        return str.replace(/\\"|\\'/g, '"'); 
    });
    
    tpl = '"use strict";var view = "' + tpl + '";return view;';

    try{
        that.cache = tpl = new Function('d, _escape_', tpl);
        return tpl(data, tool.escape);
    } catch(e){
        delete that.cache;
        return tool.error(e, tplog);
    }
};

Tpl.pt.render = function(data, callback){
    var that = this, tpl;
    if(!data) return tool.error('no data');
    tpl = that.cache ? that.cache(data, tool.escape) : that.parse(that.tpl, data);
    if(!callback) return tpl;
    callback(tpl);
};

var laytpl = function(tpl){
    if(typeof tpl !== 'string') return tool.error('Template not found');
    return new Tpl(tpl);
};

laytpl.config = function(options){
    options = options || {};
    for(var i in options){
        config[i] = options[i];
    }
};

laytpl.v = '1.1';

"function" == typeof define ? define(function() {
    return laytpl
}) : "undefined" != typeof exports ? module.exports = laytpl : window.laytpl = laytpl

}();
