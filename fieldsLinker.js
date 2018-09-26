/* 
 Copyright (C) Philippe Meyer 2018
 Distributed under the MIT License
 fieldsLinker v 0.6 : tooltips + disable mor effective
*/

(function ( $ ) {
	const errMsg  = "fieldsLinker error : "
	var data = {};
	var canvasId = "";
	var canvasCtx = null;
	var canvasPtr = null;
	var canvasWidth = 0;
	var canvasHeight = 0;
	var onError = false;
	var className = "fieldsLinker";
	var byName = false;
	var linksByOrder=[];
	var linksByName=[];
	var List1 = [];
	var List2 = [];	
	var Mandatories = [];
	var ListHeights1 = [];
	var ListHeights2 = [];	
	var move = null;
	var that = null;
	var lineStyle = "straight"; // straight or square-ends
	var handleColor = "#CF0000,#00AD00,#0000AD,#FF4500,#00ADAD,#AD00AD,#582900,#FFCC00,#000000,#33FFCC".split(",");
	var lineColor = "black";
	var autoDetect = "off";
	var oneToMany = "off";
	var mandatoryErrorMessage = "This field is mandatory";
	var mandatoryTooltips = true;
	var canvasTopOffset = 0;
	var isDisabled = false;
	var globalAlpha = 1;
	var autoSort = "off";
	var missingItemsOnListB = 0;
	var root;
		
	var draw = function () {
	    canvasCtx.globalAlpha = globalAlpha;
		canvasCtx.beginPath(); 
		canvasCtx.fillStyle = 'white';
		canvasCtx.strokeStyle = lineColor;
		canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
			
		var links = linksByOrder.slice(0);	
		links.sort(function(a,b){
			return a["from"] >= b["from"];
		});
		
		links.forEach(function(item,i){
			var _from = item["from"];
			var _to = item["to"];
			
			var Ax = 0;
			var Ay = ListHeights1[_from];

			var Bx = canvasWidth;
			var By = 0;
			if(autoSort == "on"){
				By = ListHeights2[_from];
			}else{
				By = ListHeights2[_to];
			}
			
			canvasCtx.beginPath(); 
			
			canvasCtx.moveTo(Ax, Ay);
			var handleCurrentColor = handleColor[_from%handleColor.length];
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
		
		if(oneToMany=="off"){
			// If the link already exists then we erase it
			eraseLinkA(infos.offsetA);
			eraseLinkB(infos.offsetB);
		}


		
		if(autoSort == "onxxx"){

			var itemGoing = $("#"+root).find(".FL-main .FL-right li").eq(infos.offsetA);
			var itemComing = $("#"+root).find(".FL-main .FL-right li[data-offset='"+infos.offsetB+"']");
			
			var dataName = $(itemComing).attr("data-name");
			var html =  $(itemComing).html();
			
			var isFree = $(itemGoing).hasClass("free");
			
			var htmlComing = $(itemGoing).html();
			$(itemComing)
				.attr("data-name",htmlComing)
				.attr("data-offset",infos.offsetA)
				.html(htmlComing);
								
			$(itemGoing)
				.attr("data-name",html)
				.attr("data-offset",infos.offsetB)
				.html(html);	
				
			if(isFree){
				$(itemGoing).attr("class","");

				$(itemComing).attr("class","inactive free");
				
			}
						
			$("#"+root).find(".FL-main .FL-right li").tooltip('destroy');
			
			$("#"+root).find(".FL-main .FL-right li")
				.attr("data-mandatory","false");
			
			
			Mandatories.forEach(function(x,i){
				 $("#"+root).find(".FL-main .FL-right li[data-name='"+x+"']")
					.attr("data-mandatory","true");
					
				if (mandatoryTooltips) {
					$("#"+root).find(".FL-main .FL-right li[data-name='"+x+"']")
					   .attr("data-placement", "top")
					   .attr("title", mandatoryErrorMessage)
					   .tooltip();
				}

			});

		}
		
		if(autoSort == "on"){
			var liArray = [];
			var ul = document.getElementById(root).querySelector(".FL-right ul"); // ".FL-main .FL-right li"
			ul.querySelectorAll("li").forEach(function(x){
				liArray.push(x);
			});
			
			var cache = null;
			var positionA = -1;
			var positionB = -1;
			liArray.forEach(function(x,i){
				var dataOffset = x.getAttribute("data-offset");			
				if (dataOffset== infos.offsetA){
					cache = x;
					positionA = i;
				}else if(dataOffset == infos.offsetB){
					
					positionB = i;
				}
			});

			if(cache != null){
				liArray[positionA] = liArray[positionB];
				liArray[positionB] = cache;
							ul.innerHTML = "";
			liArray.forEach(function(x){
				ul.appendChild(x); 
			});
			}

			


		}
		
		linksByOrder.push({"from":infos.offsetA,"to":infos.offsetB});
		linksByName.push({"from":infos.nameA,"to":infos.nameB});
			
		draw();

		$("body").trigger({
		    type: "fieldLinkerUpdate",
		    what: "addLink"
		});
	}

	var eraseLinkA = function (offset) {

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
		$("body").trigger({
		    type: "fieldLinkerUpdate",
		    what: "removeLink"
		});
	}

	var eraseLinkB = function (offset) {

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
		$("body").trigger({
		    type: "fieldLinkerUpdate",
		    what: "removeLink"
		});
	}
	
	var getMidHeight = function(that){
		var position = $(that).position();
		var hInner = $(that).height();
		var hOuter = $(that).outerHeight();
		var delta = Math.floor(0.5 + (hOuter - hInner)/2);
		var midInner = Math.floor(0.5 + hInner/2);
		var midHeight = position.top + midInner - delta;
		return midHeight;
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
				
	            if(data.localization.mandatoryErrorMessage){
	                mandatoryErrorMessage = data.localization.mandatoryErrorMessage;
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
				
	            if(data.options.oneToMany){
	                oneToMany = data.options.oneToMany;
	            }

	            if (data.options.canvasTopOffset) {
	                canvasTopOffset = data.options.canvasTopOffset;
	            }
				
				if (data.options.autoSort) {
	                autoSort = data.options.autoSort;
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
					.css({ "float": "left", "width": "40%", "display": "inline-block", "text-align": "left", "white-space": "nowrap" })
					.html(data.listA.name);

	            var $midDiv =  $("<div></div>");
	            $midDiv
					.appendTo($main)
					.addClass("FL-mid")
					.css({ "display": "inline-block", "width": "20%" });
					
	            var $rightDiv =  $("<div></div>");
	            $rightDiv
					.appendTo($main)
					.addClass("FL-right")
					.css({"float":"right","width":"40%","display":"inline-block","text-align":"left","white-space": "nowrap"})
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
						.css({"width":"100%","position": "relative"})
						.text(x);
					
	                var $eraseIcon = $("<i></i>");
	                $eraseIcon 
						.appendTo($li)
						.addClass("fa fa-undo unlink")
						.css({"right":"28px","color":"#aaa","position": "absolute","top":"50%","transform": "translateY(-50%)"});
	                var $pullIcon = $("<i></i>");
	                $pullIcon 
						.appendTo($li)
						.addClass("fa fa-arrows-alt link")
						.css({"right":"8px","color":"#aaa","position": "absolute","top":"50%","transform": "translateY(-50%)"});
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
					
	            Mandatories = [];
	            if(data.listB.mandatories){
	                Mandatories = data.listB.mandatories.slice(0);
	            }
	            data.listB.list.forEach(function(x,i){
	                List2.push(x);
					
	                var isMandatory = (Mandatories.indexOf(x) != -1);
					
	                var $li =  $("<li></li>");
	                $li
						.appendTo($ul)
						.attr("data-offset",i)
						.attr("data-name",x)
						.attr("data-mandatory",isMandatory)
						.text(x);

	                if (isMandatory && mandatoryTooltips) {
	                    $li
                            .attr("data-placement", "top")
                            .attr("title", mandatoryErrorMessage);

	                    $li.tooltip();
	                }
	            });

				if (autoSort == "on") {
	                missingItemsOnListB = data.listA.list.length - data.listB.list.length;
					if(missingItemsOnListB < 0) missingItemsOnListB = 0;
	            }
				
				if(missingItemsOnListB > 0){
					var listBLength =  data.listA.list.length;
					for(var i = 0; i < missingItemsOnListB;i++){
						var $li =  $("<li></li>");
							$li
							.appendTo($ul)
							.attr("data-offset",i+listBLength-1)
							.addClass("inactive free")
							.attr("data-name","&nbsp;")
							.attr("data-mandatory",false)
							.html("&nbsp;");
					}
					
				}
				
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
	            canvasPtr= document.getElementById(canvasId);
	            canvasPtr.width = canvasWidth;
	            canvasPtr.height = canvasHeight;
	            canvasCtx = canvasPtr.getContext("2d");

	            var canvasTopMargin = canvasTopOffset;

	            // Computing the vertical offset of the middle of each cell.
	            $(this).find(".FL-main .FL-left li").each(function(i){
					
	                var position = $(this).position();
	                var hInner = $(this).height();
	                var hOuter = $(this).outerHeight();
					
	                var delta = Math.floor(0.5 + (hOuter - hInner)/2);
	                var midInner = Math.floor(0.5 + hInner/2);
	                var midHeight = position.top + midInner - delta -1;
	                ListHeights1.push(midHeight);
	                if (i == 0) {
	                    canvasTopMargin += position.top;
	                }
	            });
				
	            $canvas
                    .css("margin-top", canvasTopMargin+"px");

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
	            if (data.options.buttonErase) {
	                $(this).find(".FL-main .eraseLink").on("click", function (e) {
	                    if (isDisabled) return;
	                    linksByOrder.length = 0;
	                    linksByName.length = 0;
	                    draw();
	                    $("body").trigger({
	                        type: "fieldLinkerUpdate",
	                        what: "removeLink"
	                    });
	                });
	            }
				
	            // On mousedown in left List : 
	            $(this).find(".FL-main .FL-left li").on("mousedown",function(e){
	                // we make a move object to keep track of the origine and also remember that we are starting a mouse drag (mouse is down)
	                if (isDisabled) return;
	                move = {};
	                move.offsetA = $(this).attr("data-offset");
	                move.nameA = $(this).attr("data-name");
	                move.offsetB = -1;
	                move.nameB = -1;
	            });
				
	            $(this).find(".FL-main .FL-left li .unlink").on("click", function (e) {
	                if (isDisabled) return;
	                eraseLinkA($(this).parent().attr("data-offset"));	
	                draw();
	            });
				
	            $(this).find(".FL-main .FL-left li").on("mouseup", function (e) {
	                if (isDisabled) return;
	                // We do a mouse up on le teft side : the drag is canceled
	                move=null;
	            });
				
	            // Mouse up on the right side 
	            $(this).find(".FL-main .FL-right li").on("mouseup", function (e) {
					var that = this;
	                if (isDisabled) return;
	                if(move == null){ // no drag 
						if(autoSort == "off"){
							eraseLinkB($(that).attr("data-offset")); // we erase an existing link if any
							draw();
						}
	                }else{ // we finish a drag then get the infos an create a link
						if(!$(that).hasClass("inactive")){
							eraseLinkB($(that).attr("data-offset")); // we erase an existing link if any
							move.offsetB = $(that).attr("data-offset");
							move.nameB = $(that).attr("data-name");
							var infos =  JSON.parse(JSON.stringify(move));
							move = null;
							makeLink(infos);
						}
	                }
	            });
				
	            // mousemove over a right cell
	            $(this).find(".FL-main .FL-right li").on("mousemove",function(e){
	                if (isDisabled) return;
	                if(move != null){ // drag occuring
			
	                    var _from = move.offsetA;
						 
	                    var Ax = 0;
	                    var Ay = ListHeights1[_from];
						 
	                    var Bx = canvasWidth;
						if(autoSort == "on"){
							var By = getMidHeight(this);	
						}else{
							var By = ListHeights2[_To];		
						}
	                    
						 
	                    draw();
	                    canvasCtx.beginPath(); 
	                    var color= handleColor[_from%handleColor.length];
	                    canvasCtx.fillStyle = 'white';
	                    canvasCtx.strokeStyle = color;
						
	                    canvasCtx.moveTo(Ax, Ay);
	                    canvasCtx.lineTo(Bx, By);
	                    canvasCtx.stroke();
	                }
	            });
				
	            // mousemove over the canvas
	            $(this).find("canvas").on("mousemove", function (e) {
	                if (isDisabled) return;
	                if(move != null){
	                    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
	                    // we redraw all the existing links
	                    draw();
	                    canvasCtx.beginPath(); 
	                    // we draw the new would-be link
	                    var _from = move.offsetA;
	                    var color= handleColor[_from%handleColor.length];
	                    canvasCtx.fillStyle = 'white';
	                    canvasCtx.strokeStyle = color;
						
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
				
	            $(this).find(".FL-main").on("mouseup", function (e) {
	                if (isDisabled) return;
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
				root = $(this).attr("id");
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
	                canvasWidth = $(that).find(".FL-main .FL-mid").width();
	                canvasPtr.width = canvasWidth;
	                $("#"+canvasId).css("width",canvasWidth+"px");
	                draw();
	            });
	            draw();			
	        }
	        return (this);

	    }else if(action == "eraseLinks"){
	        linksByOrder.length = 0;
	        linksByName.length = 0;
	        draw();
		
		}else if( action === "getLinks" ) {
			if(!onError){
				var isMandatoryError = false;
				var links = null;
				var errorMessage = mandatoryErrorMessage + " : ";
				var fieldInErrorName = "";
				  if(byName){
					  links = linksByName;
				  }else{
					  links = linksByOrder;
				  }
			  
			  Mandatories.forEach(function(m,i){
				  if(!isMandatoryError){
					 var match = linksByName.filter(function(link){
						return link.to == m;
					});
					if(match.length==0){
						 isMandatoryError = true;
						 fieldInErrorName = m;
					 }
				  }
			  });
			  
			  if(isMandatoryError){
				  return {
					  "error" : true,
					  "errorMessage" : errorMessage + fieldInErrorName,
					  "links" : links
				  };
			  }else{
				  
				  return {
					  "error" : false,
					  "errorMessage" : "",
					  "links" : links
				  };  
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
						draw();
					}		
					
					if(options.lineColor){
						lineColor = options.lineColor;
					}
					
					if(options.handleColor){
						handleColor = options.handleColor;
					}
					
					if(options.oneToMany){
						oneToMany = options.oneToMany;
						if(oneToMany=="off"){
							var links = linksByOrder.slice(0);
							for(var i = 0;i<links.length;i++){
								links[i].fromName = linksByName[i]["from"];
								links[i].toName = linksByName[i]["to"];

							}
							links.sort(function(a,b){
								return a["from"] >= b["from"];
							});
							
							for(var i = links.length-1;i>0;i--){
								if(links[i]["from"] == links[i-1]["from"]){
									links.splice(i, 1);
								}
							}
							
							linksByOrder = [];
							linksByName = [];
							
							links.forEach(function(x,i){
								linksByOrder.push({"from":x["from"],"to":x["to"]});
								linksByName.push({"from":x["fromName"],"to":x["toName"]});
							});						
						}
						draw();
					}
				}
			draw();
			}
		} else if (action == "disable") {
		    var that = this;
		    isDisabled = true;
		    $(that)
                .find(".eraseLink")
                .prop("disabled", isDisabled);

		    $(that)
                .find("li")
                .addClass("inactive");

		    globalAlpha = 0.5;

		    draw();

		    return (that);
		}
		else if (action == "enable") {
		    var that = this;
		    isDisabled = false;
		    $(that)
                .find(".eraseLink")
                .prop("disabled", isDisabled);

		    $(that)
                .find("li")
                .removeClass("inactive");

		    globalAlpha = 1;

		    draw();

		    return (that);
		} else {
			onError = true;
			console.log(errMsg + "no action parameter provided (param 1)" );
		} 
	}
}( jQuery ));


