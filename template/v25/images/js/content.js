
function markVideo(vd,d,t,s){
	var textStart = Array("很烂","很烂","一般","一般","不妨一看","不妨一看","比较精彩","比较精彩","棒极了","棒极了");
	var id='BT'+(new Date()).getTime();
	$.ajax({ url: "/"+sitePath+"e/tianfeng/qq871498872_ajax.php?id="+vd+"&action=videoscore", success: function(obj){
        var a=obj;
			try{
				a.replace(/\[(\d+),(\d+),(\d+)\]/i,function ($0,d,t,s){
					var x=parseInt(d)+parseInt(t),y=(Math.round(s / x * 10) / 10.0) || 0;
					document.getElementById('MARK_B1').value=x;
					document.getElementById('MARK_B2').value=y;
					document.getElementById('MARK_B3').value=s;
					if(s<=0){
						document.getElementById("filmStarScore").innerHTML = "0<i>.0</i>";
						document.getElementById("start").className = "starB s0";
					}else{
						var ky = y.toString();
						ky = ky.replace(".","<i>.");
						ky = ky + "</i>";
						document.getElementById("filmStarScore").innerHTML = ky;
						document.getElementById("start").className = "starB s" + parseInt(y, 10).toString();
						if(parseInt(y, 10)==0){ var ka = 0; }else{ var ka = parseInt(y, 10)-1; }
						document.getElementById("filmStarScoreTip").innerHTML = textStart[ka]+"("+x+"评)";
						if(document.getElementById("renums")){ document.getElementById("renums").innerHTML = x;	}
					}
				});
			}catch(ig){}
      }});
}
function startm(v){
	var textStart = Array("很烂","很烂","一般","一般","不妨一看","不妨一看","比较精彩","比较精彩","棒极了","棒极了");
  document.getElementById("filmStarScoreTip").innerHTML = textStart[v-1];
  document.getElementById("start").className = "starB s" + v.toString();
  document.getElementById("filmStarScore").innerHTML = v + "<i>.0</i>"

}
function OnStar(mid,v){
	var textStart = Array("很烂","很烂","一般","一般","不妨一看","不妨一看","比较精彩","比较精彩","棒极了","棒极了");
	$.ajax({ url: "/"+sitePath+"e/tianfeng/qq871498872_ajax.php?id="+mid+"&action=score&score="+v, success: function(obj){
      var x=''+obj;
		if(x.indexOf("havescore")!=-1){
			alert('你已经评过分啦');
		}else{
			var x = parseFloat(document.getElementById("MARK_B1").value);
			var y = parseFloat(document.getElementById("MARK_B2").value);
			var z = parseFloat(document.getElementById("MARK_B3").value);
			var kx = x + 1;//人数
			var kz = z + v;//总分
			var ky = (Math.round(kz / kx * 10) / 10) || 0;
			document.getElementById("MARK_B1").value = kx;
			document.getElementById("MARK_B2").value = ky;
			document.getElementById("MARK_B3").value = kz;
			var kky = ky.toString();
			if(kky.indexOf(".")<0){
				kky = kky + ".0";
			}
			kky = kky.replace(".","<i>.");
			kky = kky + "</i>";
			document.getElementById("filmStarScore").innerHTML = kky;
			document.getElementById("start").className = "starB s" + (parseInt(ky, 10)-1).toString();
			document.getElementById("filmStarScoreTip").innerHTML = "感谢您的参与！";
			alert("已有"+kx+"人参与评分");
			//document.getElementById("filmStarScoreTip").innerHTML = textStart[ky]+"("+kx+"评)";
			if(document.getElementById("renums")){ document.getElementById("renums").innerHTML = kx;	}
			setTimeout(kaifach,10000);
		}
	}});

}
function kaifach(){
	var textStart = Array("很烂","很烂","一般","一般","不妨一看","不妨一看","比较精彩","比较精彩","棒极了","棒极了");
	var x = parseFloat(document.getElementById("MARK_B1").value);
	var y = parseFloat(document.getElementById("MARK_B2").value);
	var z = parseFloat(document.getElementById("MARK_B3").value);

	var ky = y.toString();
	if(ky.indexOf(".")<0){
		ky = ky + ".0";
	}
	ky = ky.replace(".","<i>.");
	ky = ky + "</i>";
	document.getElementById("filmStarScore").innerHTML = ky;
	document.getElementById("start").className = "starB s" + parseInt(y, 10).toString();
	if(parseInt(y, 10)>0){
		document.getElementById("filmStarScoreTip").innerHTML = textStart[parseInt(y, 10)-1]+"("+x+"评)";
	}else{
		if(z>0){
			document.getElementById("filmStarScoreTip").innerHTML = textStart[0]+"("+x+"评)";
		}else{
			document.getElementById("filmStarScoreTip").innerHTML = "";
		}
	}


}

function getSubstr(downurl){
    var resultStr = downurl
    if(downurl.indexOf("ed2k://|file|")==0){
        var tmpStr =  resultStr.split('|');
        if(tmpStr.length>3){
            if(tmpStr[2].length>0){
                resultStr = decodeURIComponent(tmpStr[2]);
            }
        }

        return resultStr;
    }else{
        return resultStr;
    }
}
$(document).ready(function(){

$('.downlisttps').html('');
});
