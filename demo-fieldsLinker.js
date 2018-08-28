
(function ( $ ) {
	
const errMsg  = "fieldsLinker error : "
var data = {};
var canvasId = "";
var canvasCtx = null;
var canvasPtr = null;
var canvasWidth = 0;
var canvasHeight = 0;
var canvasHalfWidth = 0;
var onError = false;
var className = "fieldsLinker";
var byName = false;
var linksByOrder=[];
var linksByName=[];
var List1 = [];
var List2 = [];	
var ListHeights1 = [];
var ListHeights2 = [];	
var move = null;
var that = null;
var lineStyle = "straight"; // straight or square-ends
var handleColor = "#CF0000,#00AD00,#0000AD,#FF4500,#00ADAD,#AD00AD,#582900,#FFCC00,#000000,#33FFCC".split(",");
var lineColor = "black";
var autoDetect = "off";

	
var draw = function(){
	canvasCtx.beginPath(); 
	canvasCtx.fillStyle = 'white';
	canvasCtx.strokeStyle = lineColor;
	canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
		
	linksByOrder.forEach(function(item,i){
		var _from = item["from"];
		var _to = item["to"];
		
		var Ax = 0;
		var Ay = ListHeights1[_from];

		var Bx = canvasWidth;
		var By = ListHeights2[_to];
	

		canvasCtx.beginPath(); 
		
		canvasCtx.moveTo(Ax, Ay);
	var handleCurrentColor = handleColor[i%handleColor.length];
		if(lineStyle == "square-ends"){
				
			canvasCtx.fillStyle = handleCurrentColor;
			canvasCtx.strokeStyle = handleCurrentColor;
			canvasCtx.rect(Ax, Ay-4, 8, 8);
			canvasCtx.rect(Bx-8, By-4, 8, 8);
			canvasCtx.fill();
			
			canvasCtx.moveTo(Ax+8, Ay);
			canvasCtx.lineTo(Ax+16, Ay);
			canvasCtx.lineTo(Bx-16, By);
			canvasCtx.lineTo(Bx-8, By);
			canvasCtx.stroke();
		}else{
			canvasCtx.strokeStyle = handleCurrentColor;
			canvasCtx.lineTo(Bx, By);
			canvasCtx.stroke();
		}
		
	});
}
	

var makeLink  = function(infos){
	eraseLinkA(infos.offsetA);
	eraseLinkB(infos.offsetB);
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
			
			if(data.options.lineStyle){
				if(data.options.lineStyle=="square-ends")
					lineStyle = "square-ends";
			}		
			
			if(data.options.lineColor){
				lineColor = data.options.lineColor;
			}
			
			if(data.options.handleColor){
				handleColor = data.options.handleColor.split(",");
			}
			
			if(data.options.autoDetect){
				autoDetect = data.options.autoDetect;
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
				.css({"float":"left","width":"40%","display":"inline-block","text-align":"left"})
				.html(data.listA.name);

			var $midDiv =  $("<div></div>");
			$midDiv
				.appendTo($main)
				.addClass("FL-mid")
				.css({"display":"inline-block","width":"20%"})
				.html("<br />");
				
				
			var $rightDiv =  $("<div></div>");
			$rightDiv
				.appendTo($main)
				.addClass("FL-right")
				.css({"float":"right","width":"40%","display":"inline-block","text-align":"left"})
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
			
			if(data.options.buttonErase){
				var $btn =  $("<button></button>");
				$btn 
					.appendTo($(this).find(".FL-main"))
					.attr("type","button")
					.addClass("btn btn-danger  btn-sm eraseLink")
					.html(data.options.buttonErase);
			}


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
			
			canvasWidth = w;
			canvasHeight = h;		
            canvasHalfWidth = Math.floor(0.5 + w/2);			
			canvasPtr= document.getElementById(canvasId);
			canvasPtr.width = canvasWidth;
			canvasPtr.height = canvasHeight;
			canvasCtx = canvasPtr.getContext("2d");
			
			// Computing the vertical offset of the middle of each cell.
			$(this).find(".FL-main .FL-left li").each(function(i){
				
				var position = $(this).position();
				var hInner = $(this).height();
				var hOuter = $(this).outerHeight();
				
				var delta = Math.floor(0.5 + (hOuter - hInner)/2);
				var midInner = Math.floor(0.5 + hInner/2);
				var midHeight = position.top + midInner - delta;
				ListHeights1.push(midHeight);
			});
			
			// Computing the vertical offset of the middle of each cell.
			$(this).find(".FL-main .FL-right li").each(function(i){
				var position = $(this).position();
				var hInner = $(this).height();
				var hOuter = $(this).outerHeight();
				var delta = Math.floor(0.5 + (hOuter - hInner)/2);
				var midInner = Math.floor(0.5 + hInner/2);
				var midHeight = position.top + midInner - delta;
				ListHeights2.push(midHeight);
			});
			
			// Listeners :
			if(data.options.buttonErase){
				$(this).find(".FL-main .eraseLink").on("click",function(e){
					linksByOrder.length = 0;
					linksByName.length = 0;
					draw();
				});
			}
			// On mousedown in left List : 
			$(this).find(".FL-main .FL-left li").on("mousedown",function(e){
				// we make a move object to keep track of the origine and also remember that we are starting a mouse drag (mouse is down)
				 move = {};
				 move.offsetA = $(this).data("offset");
				 move.nameA = $(this).data("name");
				 move.offsetB = -1;
				 move.nameB = -1;
				 // If the link already exists then we erase it
				 eraseLinkA($(this).data("offset"));
			});
			
			$(this).find(".FL-main .FL-left li").on("mouseup",function(e){
				// We do a mouse up on le teft side : the drag is canceled
				 move=null;
			});
			
			// Mouse up on the right side 
			$(this).find(".FL-main .FL-right li").on("mouseup",function(e){
				 if(move == null){ // no drag 
					 eraseLinkB($(this).data("offset")); // we erase an existing link if any
					 draw();
				 }else{ // we finish a drag then get the infos an create a link
					 eraseLinkB($(this).data("offset")); // we erase an existing link if any
					 move.offsetB = $(this).data("offset");
					 move.nameB = $(this).data("name");
					 var infos =  JSON.parse(JSON.stringify(move));
					 move = null;
					 makeLink(infos);
				 }
			});
			
			// mousemove over a right cell
			$(this).find(".FL-main .FL-right li").on("mousemove",function(e){
					
				 if(move != null){ // drag occuring
		
					 var _from = move.offsetA;
					 var _To = $(this).data("offset");
					 
					 var Ax = 0;
					 var Ay = ListHeights1[_from];
					 
					 var Bx = canvasWidth;
					 var By = ListHeights2[_To];
					 
					draw();
					canvasCtx.beginPath(); 
					var offset  = linksByOrder.length;
					var color= handleColor[offset%handleColor.length];
					canvasCtx.fillStyle = 'white';
					canvasCtx.strokeStyle = color;
					
					canvasCtx.moveTo(Ax, Ay);
					canvasCtx.lineTo(Bx, By);
					canvasCtx.stroke();
				 }
			});
			
			// mousemove over the canvas

			
			$(this).find("canvas").on("mousemove",function(e){
	
				if(move != null){

					canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
					// we redraw all the existing links
					draw();
					canvasCtx.beginPath(); 
					// we draw the new would-be link
					var offset  = linksByOrder.length;
					var color= handleColor[offset%handleColor.length];
					canvasCtx.fillStyle = 'white';
					canvasCtx.strokeStyle = color;
					var _from = move.offsetA;
					
					var Ax = 0;
					var Ay = ListHeights1[_from];
					// mouse position relative to the canvas
					var Bx = e.offsetX;
					var By = e.offsetY;
					
					canvasCtx.moveTo(Ax, Ay);
					canvasCtx.lineTo(Bx, By);
					canvasCtx.stroke();
					
				}
			});
			
			$(this).find(".FL-main").on("mouseup",function(e){
				if(move!=null){
					move = null;
					draw();
				}
					
			});
			
			if(data.existingLinks){
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
			}	
			
			if(autoDetect=="on"){
				
				
				List1.forEach(function(name,i){
					var nameA = name.toLowerCase().replace(/[^a-z]+/g, '');
					if (!Array.prototype.findIndex){ // for IE
						var result = -1;
						List2.forEach(function(x,j){
							if(result==-1){
								var nameB = x.toLowerCase().replace(/[^a-z]+/g, '');
								if(nameA == nameB){
									result = j;
								}else if(nameA == nameB.substring(0,nameA.length)){
									result = j;
								}
							}
						});
					}else{
						var result = List2.findIndex(function(x){
						var nameB = x.toLowerCase().replace(/[^a-z]+/g, '');
						if(nameA == nameB){
							return true;
						}else{
							return nameA == nameB.substring(0,nameA.length);
						}
						
					});	
					}

					if(result!=-1){
						var infos = {};
						 infos.offsetA = i;
						 infos.nameA = name;
						 infos.offsetB = result;
						 infos.nameB =List2[result];
						
						makeLink(infos);
					}
					
				});

			}
			
			that = this; // keep the context for listeners
			
			$(window).resize(function() {
				canvasWidth = $(".FL-main .FL-mid").width();
				canvasPtr.width = canvasWidth;
				$("#"+canvasId).css("width",canvasWidth+"px");
	
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
	}else if( action === "changeParameters" ) {
		if(!onError){
			if(input){
				var options = JSON.parse(JSON.stringify(input));
				if(options.className){
					className = options.className;
				}
				if(options.byName){
					byName = options.byName;
				}
				
				if(options.lineStyle){
						lineStyle =options.lineStyle;
				}		
				
				if(options.lineColor){
					lineColor = options.lineColor;
				}
				
				if(options.handleColor){
					handleColor = options.handleColor;
				}
			}
		draw();
		}
	}else{
		onError = true;
		console.log(errMsg + "no action parameter provided (param 1)" );
	} 
}
 
}( jQuery ));


