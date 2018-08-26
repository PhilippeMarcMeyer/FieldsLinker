# FieldsLinker

Allow to make a 1 to 1 link between elements of 2 lists

Given 2 lists : for instance one from a text import, the second listing the fields a db table

the jquery plugin allos you to draw and save links between the 2 lists

My first jquery plug-in

v0.01 : first commit : todo => parameters should not be necessary cellHeight,List1Width,canvasWidth,List2Width and should be calculated
v0.1  : the lines are drawn while dragging over the canvas and the horizontal middle points of the cells are calculated	
no parameters anymore

Tested on : Chrome, Firefox, Chromium, IE, Opéra : OK for Chrome, Firefox and Opera
todo : horizontal middle points of the cells are wrong on IE and the canvas zone (between the 2 lists) is selected which is not aesthetic.


https://philippemarcmeyer.github.io/demo-fieldsLinker.html

<pre>
var fieldLinks;
		$( document ).ready(function() {
			var existingLinks = [{"from":"firstName","to":"first_name"}] ;
			var input = {
			    "options":{
					"byName" : true,
					"className":"fieldsLinker"

				},
				"listA":
					{
						"name":"columns in files",
						"list" : [
							"firstName",
							"lastName",
							"phone",
							"email",
							"role"						
						]
					},
				"listB":
					{
						"name":"Fields available",
						"list" : [
							"Id",
							"Company",
							"jobTitle",
							"adress",
							"first_name",
							"last_name",
							"email_adress"
						]
					},
				"existingLinks": existingLinks

			};
			
		  	fieldLinks=$("#bonds").fieldsLinker("init",input);
			
			$("#input").html("input => " + JSON.stringify(existingLinks));
			$(".fieldLinkerSave").on("click",function(){
				var results = fieldLinks.fieldsLinker("getLinks");
				$("#output").html("output => " + JSON.stringify(results));
			});
			
		});
 
</pre>
