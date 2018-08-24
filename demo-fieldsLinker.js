
(function ( $ ) {
	
const errMsg  = "fieldsLinker error : "
var data = {};
var canvasId = "";
var canvasCtx = null;
var canvasPtr = null;
var List1Width = 300;
var List2Width = 300;
var canvasWidth = 300;
var canvasHeight = 500;
var onError = false;
var className = "fieldsLinker";
var byName = false;
var linksByOrder=[];
var linksByName=[];
var List1 = [];
var List2 = [];	
var move = {};
var that = null;
var cellHeight = 50;


	
var draw = function(){
		
	canvasCtx.fillStyle = 'white';
	canvasCtx.strokeStyle = 'black';
	canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
	canvasCtx.beginPath(); 
	linksByOrder.forEach(function(item,i){
		
		var _from = item["from"];
		var _to = item["to"];
		
		var Ax = 0;
		var Bx = canvasWidth;

		var Ay = (_from * cellHeight) + cellHeight/2;
		var By = (_to * cellHeight) + cellHeight/2;
		
		canvasCtx.moveTo(Ax, Ay);
		canvasCtx.lineTo(Bx, By);
		canvasCtx.stroke();

	});
}
	

var makeLink  = function(infos){
	
	eraseLinkA(infos.offsetA);
	linksByOrder.push({"from":infos.offsetA,"to":infos.offsetB});
	linksByName.push({"from":infos.nameA,"to":infos.nameB});
	draw();
}

var eraseLinkA = function(offset){
	var pos = -1;
	linksByOrder.forEach(function(x,i){
		if(x.from == offset){
			pos = i;
		}
	});
	if(pos!=-1){
		linksByOrder.splice(pos,1);
		linksByName.splice(pos,1);
		draw();
	}
}

var eraseLinkB = function(offset){
	var pos = -1;
	linksByOrder.forEach(function(x,i){
		if(x.to == offset){
			pos = i;
		}
	});
	if(pos!=-1){
		linksByOrder.splice(pos,1);
		linksByName.splice(pos,1);
		draw();
	}
}




	
$.fn.fieldsLinker = function(action,input) {

	if (action == "init") {
		if(!input){
			onError = true;
			console.log(errMsg + "no input parameter provided (param 2)" );
		}
		if(input){
			data = JSON.parse(JSON.stringify(input));
			if(data.options.className){
				className = data.options.className;
			}
			if(data.options.byName){
				byName = data.options.byName;
			}
			if(data.options.cellHeight){
				cellHeight = data.options.cellHeight;
			}
			if(data.options.canvasWidth){
				canvasWidth = data.options.canvasWidth;
			}
			if(data.options.List1Width){
				List1Width = data.options.List1Width;
			}
			if(data.options.List2Width){
				List2Width = data.options.List2Width;
			}	
			
		
			
			$(this).html("");
			var $main = $("<div></div>");
			$main
				.appendTo($(this))
				.addClass("FL-main "+className)
				.css({"position":"relative","width":"100%","text-align":"left"});
				
			var $leftDiv =  $("<div></div>");
			$leftDiv
				.appendTo($main)
				.addClass("FL-left")
				.css({"position":"absolute","left":"0px","width":List1Width+"px","display":"inline-block","text-align":"left"})
				.html(data.listA.name);

			var $midDiv =  $("<div></div>");
			$midDiv
				.appendTo($main)
				.addClass("FL-mid")
				.css({"display":"inline-block","position":"absolute","left":List1Width+"px","width":canvasWidth+"px"});
			
			var $rightDiv =  $("<div></div>");
			$rightDiv
				.appendTo($main)
				.addClass("FL-right")
				.css({"position":"absolute","left":(List1Width + canvasWidth)+"px","width":List2Width+"px","display":"inline-block","text-align":"left"})
				.html(data.listB.name);
				
			var $ul =  $("<ul></ul>");
			$ul
				.appendTo($leftDiv)
				.css({"text-align":"left","list-style":"none"})
				
			data.listA.list.forEach(function(x,i){
				List1.push(x);
				var $li =  $("<li></li>");
				$li
					.appendTo($ul)
					.attr("data-offset",i)
					.attr("data-name",x)
					.text(x);
				
			});


			
			var $ul =  $("<ul></ul>");
			$ul
				.appendTo($rightDiv)
				.css({"text-align":"left","list-style":"none"})
				
			data.listB.list.forEach(function(x,i){
				List2.push(x);
				var $li =  $("<li></li>");
				$li
					.appendTo($ul)
					.attr("data-offset",i)
					.attr("data-name",x)
					.text(x);
				
			});
			
			
			canvasId = "cnv_"+Date.now();
			
			var w = $midDiv.width();	
			var h2 = $rightDiv.height();	
			var h1 = $leftDiv.height();	
			var h = h1 >= h2 ? h1 : h2;
			var $canvas =  $("<canvas></canvas>");
			$canvas
				.appendTo($midDiv)
				.attr("id",canvasId)
				.css({"width": w+"px","height":h+"px"});
			
			//canvasWidth = w;
			canvasHeight = h;				
			canvasPtr= document.getElementById(canvasId);
			canvasPtr.width = canvasWidth;
			canvasPtr.height = canvasHeight;
			canvasCtx = canvasPtr.getContext("2d");
			
			$(this).find(".FL-main .FL-left li").on("mousedown",function(e){
				move = {};
				 move.offsetA = $(this).data("offset");
				 move.nameA = $(this).data("name");
				 move.offsetB = -1;
				 move.nameB = -1;
			});
			
			$(this).find(".FL-main .FL-left li").on("mouseup",function(e){
				 move=null;
				 eraseLinkA($(this).data("offset"));
			});
			
			$(this).find(".FL-main .FL-right li").on("mouseup",function(e){
				 if(move == null){
					 eraseLinkB($(this).data("offset"));
				 }else{
					 move.offsetB = $(this).data("offset");
					 move.nameB = $(this).data("name");
					 var infos =  JSON.parse(JSON.stringify(move));
					 move = null;
					 makeLink(infos);
				 }
			});
			
			data.existingLinks.forEach(function(link){
					var pos = -1;
					if(byName){
						
						var offA = List1.indexOf(link["from"]);
						var offB = List2.indexOf(link["to"]);
						if(offA !=-1 && offB!=-1){
							var linkWithOffset = {
								"from": offA,
								"to": offB,
							}
							linksByName.push(link);
							linksByOrder.push(linkWithOffset);
						}
					}else{
						var offA = link["from"];
						var offB = link["to"];
						if(offA < List1.length && offB < List2.length){
							var linkWithNames = {
								"from":List1[offA],
								"to": List2[offB]
							}
						linksByOrder.push(link);
						linksByName.push(linkWithNames);				
						}

					}

			});
			
			that = this; // keep the context for listeners
			
			$(window).resize(function() {
			   draw();
			});

			draw();
			
			
		}
		return(this);
		
	}else if( action === "getLinks" ) {
		if(!onError){
		  if(byName){
			  return linksByName;
		  }else{
			  return linksByOrder;
		  }
		}else{
			return [];
		}
	}else{
		onError = true;
		console.log(errMsg + "no action parameter provided (param 1)" );
	} 
}
 
}( jQuery ));


