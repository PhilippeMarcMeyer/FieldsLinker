# FieldsLinker

Designed for matching files headers to database fields during the process importing. 
Allows drawing links between elements of 2 lists (headers of the file on the left, column names on the right)
and getting back the result in a js object

Given 2 lists : for instance one from a text import, the second listing the fields a db table
the jquery plugin allows you to draw and save links between the 2 lists

You can link on a one to one basis or on a one to many basis. Fields can be declared as mandatory the result reporting an error in case there are not filled.

![screen shot](https://raw.githubusercontent.com/PhilippeMarcMeyer/FieldsLinker/master/filedLinker.jpg)
v 0.72 : New lineStyle : square-ends-dotted : white dots at the beginings and ends of lines on hover
v 0.60 : 
Mandatory fields show a tooltip (mandatoryErrorMessage)
disable/enable : disable/enable everything, the global opacity is set to 0.5
canvasTopOffset : integer to tweek the vertical position of the canvas where the links are drawn 
sometimes useless. example : -4 => set the canvas zone 4px closer to the top.

v 0.45 : Mandatory fields. the css is now in his own file.

v 0.41 : the colors don't change when links are deleted and the color of the link while drawing is consistent with the final result

v 0.4 : new option allowing to link one to many

v 0.3 :
FieldsLinker becomes responsive !

v 0.2 :
You can choose beetween an output with positions or names
Colours can be re-defined and lines come in 2 flavours
You may input somme links from a previous session
Auto-detect feature helps you find part of the links (optional)
Optional "Erase Links" button
Works in Chrome, Chromium, Opera, Firefox and IE (9+)

v 0.1  : the lines are drawn while dragging over the canvas and the horizontal middle points of the cells are calculated	
no parameters anymore

Tested on : Chrome, Firefox, Chromium, IE, Opéra : OK for Chrome, Firefox and Opera
todo : horizontal middle points of the cells are wrong on IE 
and on chromium the canvas zone (between the 2 lists) is selected during the dragging process which is not aesthetic.

v0.01 : first commit : todo => parameters should not be necessary cellHeight,List1Width,canvasWidth,List2Width and should be calculated

https://philippemarcmeyer.github.io/FieldsLinker/index.html

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
