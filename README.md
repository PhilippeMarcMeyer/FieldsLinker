# FieldsLinker

Allow to make a 1 to 1 link between elements of 2 lists

Given 2 lists : for instance one from a text import, the second listing the fields a db table

the jquery plugin allows you to draw and save links between the 2 lists

My first jquery plug-in

v0.3 :
FieldsLinker becomes responsive !

v0.2 :
You can choose beetween an output with positions or names
Colours can be re-defined and lines come in 2 flavours
You may input somme links from a previous session
Auto-detect feature helps you find part of the links (optional)
Optional "Erase Links" button
Works in Chrome, Chromium, Opera, Firefox and IE (9+)

v0.1  : the lines are drawn while dragging over the canvas and the horizontal middle points of the cells are calculated	
no parameters anymore

Tested on : Chrome, Firefox, Chromium, IE, Opéra : OK for Chrome, Firefox and Opera
todo : horizontal middle points of the cells are wrong on IE 
and on chromium the canvas zone (between the 2 lists) is selected during the dragging process which is not aesthetic.

v0.01 : first commit : todo => parameters should not be necessary cellHeight,List1Width,canvasWidth,List2Width and should be calculated

https://philippemarcmeyer.github.io/demo-fieldsLinker.html

<pre>
	var fieldLinks;
		$( document ).ready(function() {
				var input = {
			    "options":{
					"byName" : true,
					"lineStyle":"square-ends",
					"buttonErase":"Erase Links",
					"autoDetect":"on"
				},
				"listA":
					{
						"name":"columns in files",
						"list" : [
							"firstName",
							"lastName",
							"phone",
							"email",
							"role",
							"Birthday",
							"Adress",
							"Sales"
						]
					},
				"listB":
					{
						"name":"Fields available",
						"list" : [
							"Id",
							"Company",
							"jobTitle",
							"adress 1",	
							"adress 2",	
							"first_name",
							"last_name",
							"email_adress",
							"Phone number"
						]
					}

			};
			
		  	fieldLinks=$("#bonds").fieldsLinker("init",input);
</pre>
