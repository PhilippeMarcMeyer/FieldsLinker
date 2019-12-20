/* eslint-disable no-unused-vars */
/*

   https://github.com/PhilippeMarcMeyer/FieldsLinker v 0.91
   v 0.91 : fix mobileClickIt if set, add selected css classes
   v 0.90 : Code beautified by flartet 
   v 0.89 : Corrected a bug that corrupted the links array of objects detected by flartet on github
   v 0.88 : New display mode : idea by Naveen nsirangu => show links between two "tables" linked by ids like a join in sql. instead of headers names, objects ar provided
   v 0.87 : New option for touch devices {"mobileClickIt":true} : idea by Norman Tomlins => make links more easily on touch devices just by clicking 
*/
let FL_Factory_Lists = null;
let FL_Original_Factory_Lists = null;

(function ($) {
    var bootstrap_enabled = (typeof $().modal == 'function');
    const errMsg = 'fieldsLinker error : ';
    var factory;
    var data = {};
    var listsNr = 0;
    var listNames = [];
    var listA = [];
    var listB = [];
    var chosenListA = '';
    var chosenListB = '';
    var keyNameA = '';
    var keyNameB = '';
    var dropDownForLists = null;
    var $leftDiv, $midDiv, $rightDiv, $canvas;
    var canvasId = '';
    var canvasCtx = null;
    var canvasPtr = null;
    var canvasWidth = 0;
    var canvasHeight = 0;
    var mandatoryErrorMessage = 'This field is mandatory';
    var mandatoryTooltips = true;
    var onError = false;
    var className = 'fieldsLinker';
    var linksByName = [];
    var ListHeights1 = [];
    var ListHeights2 = [];
    var move = null;
    var that = null;
    var lineStyle = 'straight'; // straight or square-ends
    var handleColor = '#CF0000,#00AD00,#0000AD,#FF4500,#00ADAD,#AD00AD,#582900,#FFCC00,#000000,#33FFCC'.split(',');
    var lineColor = 'black';
    var associationMode = 'oneToOne';
    var isDisabled = false;
    var globalAlpha = 1;
    let mandatories = [];
    let displayMode = 'original';
    let hideLink = false;
    let isTouchScreen = is_touch_device();
    let mobileClickIt = false;


    var draw = function () {
        var tablesAB = chosenListA + '|' + chosenListB; // existingLinks
        canvasCtx.globalAlpha = globalAlpha;
        canvasCtx.beginPath();
        canvasCtx.fillStyle = 'white';
        canvasCtx.strokeStyle = lineColor;
        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        var links = linksByName.filter(function (x) {
            return x.tables == tablesAB;
        });
        links.forEach(function (item, i) {
            var positionA = -1;
            var positionB = -1;
            if (displayMode == 'original') {
                positionA = listA.indexOf(item.from);
                positionB = listB.indexOf(item.to);
            } else if (displayMode == 'alternateView') {
                listA.forEach(function (x, j) {
                    if (x[keyNameA] == item.from) {
                        positionA = j;
                    }
                });
                listB.forEach(function (x, j) {
                    if (x[keyNameB] == item.to) {
                        positionB = j;
                    }
                });

            }
            if (positionB == -1 || positionA == -1) {
                console.log('error link names unknown');
                return;
            }
            var Ax = 0;
            var Ay = ListHeights1[positionA];
            var Bx = canvasWidth;
            var By = ListHeights2[positionB];
            canvasCtx.beginPath();
            canvasCtx.moveTo(Ax, Ay);
            var handleCurrentColor = handleColor[i % handleColor.length];
            if (lineStyle == 'square-ends' || lineStyle == 'square-ends-dotted') {
                canvasCtx.fillStyle = handleCurrentColor;
                canvasCtx.strokeStyle = handleCurrentColor;
                canvasCtx.rect(Ax, Ay - 4, 8, 8);
                canvasCtx.rect(Bx - 8, By - 4, 8, 8);
                canvasCtx.fill();
                canvasCtx.stroke();
                canvasCtx.moveTo(Ax + 8, Ay);
                canvasCtx.lineTo(Ax + 16, Ay);
                canvasCtx.lineTo(Bx - 16, By);
                canvasCtx.lineTo(Bx - 8, By);
                canvasCtx.stroke();
            } else {
                canvasCtx.strokeStyle = handleCurrentColor;
                canvasCtx.lineTo(Bx, By);
                canvasCtx.stroke();
            }
            canvasCtx.closePath();
            canvasCtx.lineWidth = 1;
        });
    };
    var makeLink = function (infos) {
        var tablesAB = chosenListA + '|' + chosenListB;
        var already = false;
        var test = linksByName.filter(function (x) {
            return x.tables == tablesAB && x.to == infos.nameB && x.from == infos.nameA;
        });
        if (test.length > 0) already = true;
        if (!already) {
            if (associationMode == 'oneToOne') {
                for (var i = linksByName.length - 1; i >= 0; i--) {
                    if (linksByName[i].tables == tablesAB && linksByName[i].to == infos.nameB) {
                        linksByName.splice(i, 1);
                    }
                }

                for (var i = linksByName.length - 1; i >= 0; i--) {
                    if (linksByName[i].tables == tablesAB && linksByName[i].from == infos.nameA) {
                        linksByName.splice(i, 1);
                    }
                }
            }
            linksByName.push({
                'tables': tablesAB,
                'from': infos.nameA,
                'to': infos.nameB
            });
            $('body').trigger({
                type: 'fieldLinkerUpdate',
                what: 'addLink'
            });
        }
        draw();
    };
    var eraseLinkA = function (nameA) {
        var tablesAB = chosenListA + '|' + chosenListB;
        for (var i = linksByName.length - 1; i >= 0; i--) {
            if (linksByName[i].tables == tablesAB && linksByName[i].from == nameA) {
                linksByName.splice(i, 1);
            }
        }
        draw();
        $('body').trigger({
            type: 'fieldLinkerUpdate',
            what: 'removeLink'
        });
    };
    var eraseLinkB = function (nameB) {
        var tablesAB = chosenListA + '|' + chosenListB;
        for (var i = linksByName.length - 1; i >= 0; i--) {
            if (linksByName[i].tables == tablesAB && linksByName[i].to == nameB) {
                linksByName.splice(i, 1);
            }
        }
        draw();
        $('body').trigger({
            type: 'fieldLinkerUpdate',
            what: 'removeLink'
        });
    };
    var readUserPreferences = function () {
        if (data.options.className) {
            className = data.options.className;
        }
        if (data.options.lineStyle) {
            if (data.options.lineStyle == 'square-ends' || data.options.lineStyle == 'square-ends-dotted')
                lineStyle = data.options.lineStyle;
        }
        if (data.options.lineColor) {
            lineColor = data.options.lineColor;
        }
        if (data.options.displayMode) {
            displayMode = data.options.displayMode;
            if (displayMode != 'alternateView') {
                displayMode = 'original';
            }
        }

        if (displayMode == 'alternateView') {
            if (data.options.displayModeHideKey) {
                hideLink = data.options.displayModeHideKey;
            }
        }
        if (data.options.handleColor) {
            handleColor = data.options.handleColor.split(',');
        }
        if (data.options.associationMode) {
            associationMode = data.options.associationMode;
        }
        if (data.options.mobileClickIt) {
            mobileClickIt = true;
        }
    };
    var fillChosenLists = function () {
        listNames = [];
        listA = [];
        listB = [];
        if (chosenListA == '' || chosenListB == '') {
            chosenListA = data.Lists[0].name;
            chosenListB = data.Lists[1].name;
        }
        keyNameA = data.Lists[0].keyName || '';
        keyNameB = data.Lists[1].keyName || '';

        data.Lists.forEach(function (x) {
            listNames.push(x.name);
            if (x.name == chosenListA) {
                x.list.forEach(function (y) {
                    listA.push(y);
                });
            }
            if (x.name == chosenListB) {
                if (x.mandatories != undefined) {
                    mandatories = x.mandatories;
                }
                x.list.forEach(function (y) {
                    listB.push(y);
                });
            }
        });
    };
    var makeDropDownForLists = function () {
        dropDownForLists = $('<select></select>');
        dropDownForLists
            .css('width', '100%');
        listNames.forEach(function (x) {
            var $option = $('<option></option>');
            $option
                .val(x)
                .text(x)
                .appendTo(dropDownForLists);
        });
    };
    var drawColumnsAtLoadTime = function () {
        $(factory).html('');
        var $main = $('<div></div>');
        $main
            .appendTo($(factory))
            .addClass('FL-main ' + className)
            .css({
                'position': 'relative',
                'width': '100%',
                'text-align': 'left'
            });

        $leftDiv = $('<div></div>');
        $leftDiv
            .appendTo($main)
            .addClass('FL-left')
            .css({
                'float': 'left',
                'width': '40%',
                'display': 'inline-block',
                'text-align': 'left',
                'white-space': 'nowrap'
            })
            .append(dropDownForLists.clone());
        $leftDiv.find('select')
            .attr('id', 'select1')
            .val(chosenListA)
            .on('change', function () {
                chosenListA = $(this).val();
                fillChosenLists();
            });
        $midDiv = $('<div></div>');
        $midDiv
            .appendTo($main)
            .addClass('FL-mid')
            .css({
                'display': 'inline-block',
                'width': '20%'
            });
        $rightDiv = $('<div></div>');
        $rightDiv
            .appendTo($main)
            .addClass('FL-right')
            .css({
                'float': 'right',
                'width': '40%',
                'display': 'inline-block',
                'text-align': 'left',
                'white-space': 'nowrap'
            })
            .append(dropDownForLists.clone());
        $rightDiv.find('select')
            .attr('id', 'select2')
            .val(chosenListB)
            .on('change', function () {
                chosenListB = $(this).val();
                fillChosenLists();
            });
        var $ul = $('<ul></ul>');
        $ul
            .appendTo($leftDiv)
            .css({
                'text-align': 'left',
                'list-style': 'none'
            });
        if (data.options.buttonErase) {
            var $btn = $('<button></button>');
            $btn
                .appendTo($(factory).find('.FL-main'))
                .attr('type', 'button')
                .addClass('btn btn-danger  btn-sm eraseLink')
                .html(data.options.buttonErase);
        }
    };

    var createFilterDiv = function (listIndex) {
        if ($('.FL-filter-' + listIndex).length > 0) {
            return false;
        }
        // création des éléments
        let divFilter = $('<div></div>').addClass('FL-filter-' + listIndex);
        let input = $('<input type="text" name="filter' + listIndex + '" id="iFilter' + listIndex + '" />');
        let searchBtn = $('<button role="button" type="button" class="btn btn-small">' + data.options.buttonFilter + '</button>');
        input.appendTo(divFilter);
        searchBtn.appendTo(divFilter);

        // fonction de filtre à proprement parler
        searchBtn.click(function (e) {
            // réaffectation de la liste originelle
            FL_Factory_Lists.Lists[listIndex] = JSON.parse(JSON.stringify(FL_Original_Factory_Lists.Lists[listIndex]));
            var filter = $(e.target).parent().find('input').val();
            FL_Factory_Lists.Lists[listIndex].list = filterList(FL_Factory_Lists.Lists[listIndex].list, filter, FL_Factory_Lists.Lists[listIndex].keysFilter);
            $(factory).fieldsLinker('init', FL_Factory_Lists);
        });
        return divFilter;
    };


    var filterList = function (list, filter, keysFilter) {
        // en créer une nouvelle, pas de souci de ref
        let re = RegExp(filter, 'i');
        var newList = [];
        list.forEach((item) => {
            let found = false;
            for (let i = 0;
                (i < keysFilter.length && !found); i++) {
                if (re.test(item[keysFilter[i]])) {
                    newList.push(item);
                    found = true;
                }
            }
        });
        return newList;
    };

    var computeListHeight = function (li) {
        // outerHeight(true) adds margins too, full step is simply full outerHeight / 2 between li siblings
        var step = Math.ceil($(li).outerHeight(true) / 2);
        return  Math.floor($(li).position().top + step);
    };

    var drawColumnsContentA = function () {
        if (data.Lists[0].filter) {
            var filterDiv = createFilterDiv(0);
            if (filterDiv != false) {
                filterDiv.appendTo($leftDiv);
            }
        }
        var $ulA = $('.FL-left ul');
        if ($ulA.length == 1) {
            $ulA.empty();
        } else {
            $ulA = $('<ul></ul>');
        }
        $ulA
            .appendTo($leftDiv)
            .attr('data-col', chosenListA)
            .css({
                'text-align': 'left',
                'list-style': 'none'
            });

        listA.forEach(function (x, i) {
            let nrItems = Object.keys(x).length;
            if (hideLink) {
                nrItems--;
            }
            if (nrItems < 0) {
                nrItems = 1;
            }
            let percent = (100 / nrItems) + '%';
            var $li = $('<li></li>');
            let item = x;
            let id = x;
            if (displayMode == 'alternateView') {
                item = '<table style=\'width:100%;\'><tbody><tr>';
                for (key in x) {
                    if (key == keyNameA) {
                        id = x[key];
                        if (!hideLink) {
                            item += '<td style="width:' + percent + ';">' + x[key] + '</td>';
                        }
                    } else {
                        item += '<td style="width:' + percent + ';">' + x[key] + '</td>';
                    }
                }
                item += '</tr></tbody></table>';
            }

            $li
                .appendTo($ulA)
                .attr('data-offset', i)
                .attr('data-name', id)
                .css({
                    'width': '100%',
                    'position': 'relative'
                });
            var $div = $('<div></div>');
            $div
                .appendTo($li)
                .attr('ondrop', 'LM_drop(event)')
                .attr('ondragover', 'LM_allowDrop(event)')
                .attr('ondragstart', 'LM_drag(event)')
                .attr('draggable', 'true')
                .css({
                    'width': '80%'
                })
                .html(item);
            var $eraseIcon = $('<i></i>');
            $eraseIcon
                .appendTo($li)
                .addClass('fa fa-undo unlink')
                .attr('draggable', 'false')
                .css({
                    'right': '28px',
                    'color': '#aaa',
                    'position': 'absolute',
                    'top': '50%',
                    'transform': 'translateY(-50%)'
                });
            var $pullIcon = $('<i></i>');
            $pullIcon
                .appendTo($li)
                .addClass('fa fa-arrows-alt link')
                .attr('draggable', 'false')
                .css({
                    'right': '8px',
                    'color': '#aaa',
                    'position': 'absolute',
                    'top': '50%',
                    'transform': 'translateY(-50%)'
                });
        });
        // Computing the vertical offset of the middle of each cell.

        ListHeights1 = [];

        $(factory).find('.FL-main .FL-left li').each(function (i, li) {
            var val = computeListHeight(li);
            ListHeights1.push(val);
        });

        if (!mobileClickIt) {
            $(factory).find('.FL-main .FL-left li').off('mousedown').on('mousedown', function (e) {
                // we make a move object to keep track of the origine and also remember that we are starting a mouse drag (mouse is down)
                if (isDisabled) return;
                move = {};
                move.offsetA = $(this).data('offset');
                move.nameA = $(this).data('name');
                move.offsetB = -1;
                move.nameB = -1;
            });
        }

        if (isTouchScreen && !mobileClickIt) {
            // On mousedown in left List :
            $(factory).find('.link').off('touchstart').on('touchstart', function (e) {

                if (isDisabled) return;
                move = {};
                move.offsetA = $(this).parent().data('offset');
                move.nameA = $(this).parent().data('name');
                move.offsetB = -1;
                move.nameB = -1;

                var originalEvent = e.originalEvent;
                if (originalEvent != null && originalEvent.touches != undefined) {
                    var touch = originalEvent.touches[0];
                    if (move != null) {
                        var mouseEvent = new MouseEvent('mousedown', {
                            clientX: touch.clientX,
                            clientY: touch.clientY
                        });
                        drawImmediate(mouseEvent);
                    }
                }
            });

            $(factory).find('.link').off('touchmove').on('touchmove', function (e) {
                var originalEvent = e.originalEvent;
                if (originalEvent != null && originalEvent.touches != undefined) {
                    var touch = originalEvent.touches[0];
                    var mouseEvent = new MouseEvent('mousemove', {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                    });

                    if (move != null) {
                        drawImmediate(mouseEvent);
                    }

                }
            });

            $(factory).find('.link').off('touchend').on('touchend', function (e) {
                if (isDisabled) return;

                var originalEvent = e.originalEvent;
                if (originalEvent != null && originalEvent.touches != undefined) {
                    var touch = originalEvent.changedTouches[0];
                    var mousePosition = {
                        x: touch.clientX,
                        y: touch.clientY
                    };
                    if (move != null) {
                        let found = false;
                        $(factory).find('.FL-main .FL-right li').each(function (i) {
                            if (!found) {
                                var rect = this.getBoundingClientRect();
                                //left, top, right, bottom, width, height
                                if (mousePosition.x >= rect.left && mousePosition.x <= rect.right && mousePosition.y >= rect.top && mousePosition.y <= rect.bottom) {
                                    if (associationMode == 'oneToOne') {
                                        eraseLinkB($(this).data('name')); // we erase an existing link if any
                                    }
                                    move.offsetB = $(this).data('offset');
                                    move.nameB = $(this).data('name');
                                    var infos = JSON.parse(JSON.stringify(move));
                                    move = null;
                                    makeLink(infos);
                                    found = true;
                                }
                            }
                        });
                        if (!found) {
                            draw();
                        }
                    }
                }
            });
        }

        if (!mobileClickIt) {
            $(factory).find('.FL-main .FL-left li').off('mouseup').on('mouseup', function (e) {
                if (isDisabled) return;
                // We do a mouse up on the left side : the drag is canceled
                move = null;
            });

            $(factory).find('.FL-main .FL-left li').off('click').on('click', function (e) {
                if (isDisabled) return;
                eraseLinkA($(this).data('name'));
                draw();
            });
        }

        if (mobileClickIt) {
            $(factory).find('.FL-left li').off('click').on('click', function (e) {
                if (isDisabled) return;
                const el = $(this);
                $('.selected').removeClass('selected');
                el.addClass('selected');                
                move = {};
                move.offsetA = el.data('offset');
                move.nameA = el.data('name');
                move.offsetB = -1;
                move.nameB = -1;
            });
        }

        $(factory).find('.unlink').off('click').on('click', function (e) {
            if (isDisabled) return;
            eraseLinkA($(this).data('name'));
            draw();
        });


    };
    var drawColumnsContentB = function () {
        if (data.Lists[1].filter) {
            var filterDiv = createFilterDiv(1);
            if (filterDiv != false) {
                filterDiv.appendTo($rightDiv);
            }
        }

        var $ulB = $('.FL-right ul');
        if ($ulB.length == 1) {
            $ulB.empty();
        } else {
            $ulB = $('<ul></ul>');
        }
        $ulB
            .appendTo($rightDiv)
            .attr('data-col', chosenListB)
            .css({
                'text-align': 'left',
                'list-style': 'none'
            });

        listB.forEach(function (x, i) {
            let item = x;
            let id = x;
            if (displayMode == 'alternateView') {
                let nrItems = Object.keys(x).length;
                if (hideLink) {
                    nrItems--;
                }
                if (nrItems < 0) {
                    nrItems = 1;
                }
                let percent = (100 / nrItems) + '%';

                item = '<table style=\'width:100%;\'><tbody><tr>';
                let sep = '';
                for (key in x) {
                    if (key == keyNameB) {
                        id = x[key];
                        if (!hideLink) {
                            item += '<td style="width:' + percent + ';">' + x[key] + '</td>';
                        }
                    } else {
                        item += '<td style="width:' + percent + ';">' + x[key] + '</td>';
                    }
                }
                item += '</tr></tbody></table>';
            }
            var isMandatory = (mandatories.indexOf(x) != -1);
            var $li = $('<li></li>');
            $li
                .appendTo($ulB)
                .attr('data-offset', i)
                .attr('data-name', id)
                .attr('data-mandatory', isMandatory)
                .attr('draggable', 'true');
            var $div = $('<div></div>');
            $div
                .appendTo($li)
                .attr('ondrop', 'LM_drop(event)')
                .attr('ondragover', 'LM_allowDrop(event)')
                .attr('ondragstart', 'LM_drag(event)')
                .attr('draggable', 'true')
                .css({
                    'width': '80%'
                })
                .html(item);
            if (isMandatory && mandatoryTooltips) {
                $li
                    .attr('data-placement', 'top')
                    .attr('title', mandatoryErrorMessage);
                if (bootstrap_enabled)
                    $li.tooltip();
            }
        });
        // Computing the vertical offset of the middle of each cell.
        ListHeights2 = [];

        $(factory).find('.FL-main .FL-right li').each(function (i, li) {
            var val = computeListHeight(li);
            ListHeights2.push(val);

        });
        // Mouse up on the right side
        $(factory).find('.FL-main .FL-right li').off('mouseup').on('mouseup', function (e) {
            if (isDisabled) return;
            if (move != null) { // no drag
                if (associationMode == 'oneToOne') {
                    eraseLinkB($(this).data('name')); // we erase an existing link if any
                }
                move.offsetB = $(this).data('offset');
                move.nameB = $(this).data('name');
                var infos = JSON.parse(JSON.stringify(move));
                move = null;
                makeLink(infos);
            }
        });
        $(factory).find('.FL-main .FL-right li').off('dblclick').on('dblclick', function (e) {
            if (isDisabled) return;
            eraseLinkB($(this).data('name')); // we erase an existing link if any
            draw();
        });
        // mousemove over a right cell
        $(factory).find('.FL-main .FL-right li').off('mousemove').on('mousemove', function (e) {
            if (isDisabled) return;
            if (move != null) { // drag occuring
                var _from = move.offsetA;
                var _To = $(this).data('offset');
                var Ax = 0;
                var Ay = ListHeights1[_from];
                var Bx = canvasWidth;
                var By = ListHeights2[_To];
                draw();
                canvasCtx.beginPath();
                var color = handleColor[_from % handleColor.length];
                canvasCtx.fillStyle = 'white';
                canvasCtx.strokeStyle = color;
                canvasCtx.moveTo(Ax, Ay);
                canvasCtx.lineTo(Bx, By);
                canvasCtx.stroke();
            }
        });

        if (mobileClickIt) {
            $(factory).find('.FL-right li').off('click').on('click', function (e) {
                $('.selected').removeClass('selected');
                if (isDisabled || move === null) return;
                move.offsetB = $(this).data('offset');
                move.nameB = $(this).data('name');
                var infos = JSON.parse(JSON.stringify(move));
                move = null;
                makeLink(infos);
            });
        }
    };
    var createCanvas = function () {
        canvasId = 'cnv_' + Date.now();
        var w = $midDiv.width();
        var h2 = $rightDiv.height();
        var h1 = $leftDiv.height();
        var h = h1 >= h2 ? h1 : h2;
        $canvas = $('<canvas></canvas>');
        $canvas
            .appendTo($midDiv)
            .attr('id', canvasId)
            .css({
                'width': w + 'px',
                'height': h + 'px'
            });
        canvasWidth = w;
        canvasHeight = h;
        canvasPtr = document.getElementById(canvasId);
        canvasPtr.width = canvasWidth;
        canvasPtr.height = canvasHeight;
        canvasCtx = canvasPtr.getContext('2d');
    };

    var getTouchPos = function (e) {
        var rect = canvasPtr.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    var drawImmediate = function (e) {
        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        // we redraw all the existing links
        draw();
        canvasCtx.beginPath();
        // we draw the new would-be link
        var _from = move.offsetA;
        var color = handleColor[_from % handleColor.length];
        canvasCtx.fillStyle = 'white';
        canvasCtx.strokeStyle = color;
        var Ax = 0;
        var Ay = ListHeights1[_from];
        // mouse position relative to the canvas
        //var Bx = e.offsetX;
        //var By = e.offsetY;
        var relativePosition = getTouchPos(e);
        var Bx = relativePosition.x;
        var By = relativePosition.y;
        canvasCtx.moveTo(Ax, Ay);
        canvasCtx.lineTo(Bx, By);
        canvasCtx.stroke();

    };
    var setListeners = function () {
        // Mobiles 

        // Listeners :
        if (data.options.buttonErase) {
            $(factory).find('.FL-main .eraseLink').on('click', function (e) {
                if (isDisabled) return;
                linksByName.length = 0;
                draw();
                $('body').trigger({
                    type: 'fieldLinkerUpdate',
                    what: 'removeLink'
                });
            });
        }


        // mousemove over the canvas
        $(factory).find('canvas').on('mousemove', function (e) {
            if (isDisabled) return;
            if (move != null) {
                drawImmediate(e);
            }
        });
        $(factory).find('.FL-main').on('mouseup', function (e) {
            if (isDisabled) return;
            if (move != null) {
                move = null;
                draw();
            }
        });
        $('.FL-left select').on('change', function (e) {
            if (isDisabled) return;
            chosenListA = $(this).val();
            $('.FL-right select option').each(function () {
                $(this)
                    .attr('disabled', $(this).val() == chosenListA);
            });
            drawColumnsContentA();
            draw();
        });
        $('.FL-right select').on('change', function (e) {
            if (isDisabled) return;
            chosenListB = $(this).val();
            $('.FL-left select option').each(function () {
                $(this)
                    .attr('disabled', $(this).val() == chosenListB);
            });
            drawColumnsContentB();
            draw();
        });
    };
    $.fn.fieldsLinker = function (action, input) {
        factory = this;
        if (action == 'init') {
            $('body').on('LM_Message_Redraw', function () {
                mandatories = [];
                move = null;
                listA = [];
                listB = [];
                FL_Factory_Lists.Lists.forEach(function (x) {
                    if (x.name == chosenListA) {
                        let dict = {};
                        x.list.forEach(function (y) {
                            if (!dict[y]) {
                                dict[y] = 1;
                            } else {
                                dict[y] + 1;
                                y += '(' + dict[y] + ')';
                            }
                        });
                        listA = x.list;
                    }
                    if (x.name == chosenListB) {
                        listB = x.list;
                        if (x.mandatories != undefined) {
                            mandatories = x.mandatories;
                        }
                    }
                });
                drawColumnsContentA();
                drawColumnsContentB();
                draw();
            });
            if (!input) {
                onError = true;
                console.log(errMsg + 'no input parameter provided (param 2)');
                return;
            }
            data = JSON.parse(JSON.stringify(input));
            FL_Factory_Lists = data;
            if (FL_Original_Factory_Lists == null) {
                FL_Original_Factory_Lists = JSON.parse(JSON.stringify(data));
            }
            if (!data.Lists || data.Lists.length < 2) {
                onError = true;
                console.log(errMsg + 'provide at least 2 lists');
                return;
            }

            readUserPreferences();

            listsNr = data.Lists.length;

            if (displayMode == 'original') {
                for (let i = 0; i < listsNr; i++) {
                    let dict = {};
                    for (let j = 0; j < data.Lists[i].list.length; j++) {
                        let val = data.Lists[i].list[j];
                        if (!dict[val]) {
                            dict[val] = 1;
                        } else {
                            dict[val] += 1;
                            data.Lists[i].list[j] += '(' + dict[val] + ')';
                        }
                    }
                }
            } else if (displayMode == 'alternateView') {
                if (!data.Lists[0].keyName || !data.Lists[1].keyName) {
                    onError = true;
                    console.log(errMsg + 'alternateView mode : provide keyName properties');
                    return;
                }
            }
            fillChosenLists();
            makeDropDownForLists();
            drawColumnsAtLoadTime();
            drawColumnsContentA();
            drawColumnsContentB();
            createCanvas();
            setListeners();
            $('.FL-left select')
                .trigger('change')
                .css('border', 'none')
                .css('appearance', 'none')
                .attr('disabled', 'true');
            $('.FL-right select')
                .trigger('change')
                .css('border', 'none')
                .css('appearance', 'none')
                .attr('disabled', 'true');
            if (data.existingLinks) {
                linksByName = data.existingLinks;
                var tablesAB = chosenListA + '|' + chosenListB;
                linksByName.forEach(function (x) {
                    x.tables = tablesAB;
                });
            }
            $(window).resize(function () {
                canvasWidth = $(factory).find('.FL-main .FL-mid').width();
                canvasPtr.width = canvasWidth;
                $('#' + canvasId).css('width', canvasWidth + 'px');
                draw();
            });
            draw();
            return (factory);
        } else if (action == 'eraseLinks') {
            linksByName.length = 0;
            draw();
        } else if (action === 'getLinks') {
            if (!onError) {
                var isMandatoryError = false;
                let links = null;
                var errorMessage = mandatoryErrorMessage + ' : ';
                var fieldInErrorName = '';
                mandatories.forEach(function (m, i) {
                    if (!isMandatoryError) {
                        var match = linksByName.filter(function (link) {
                            return link.to == m;
                        });
                        if (match.length == 0) {
                            isMandatoryError = true;
                            fieldInErrorName = m;
                        }
                    }
                });
                if (isMandatoryError) {
                    return {
                        'error': true,
                        'errorMessage': errorMessage + fieldInErrorName,
                        'links': []
                    };
                } else {
                    links = [];
                    linksByName.forEach(function (x) {
                        links.push({
                            from: x.from,
                            to: x.to
                        });
                    });
                    return {
                        'error': false,
                        'errorMessage': '',
                        'links': links
                    };
                }
            } else {
                return [];
            }
        } else if (action === 'changeParameters') {
            if (!onError) {
                if (input) {
                    var options = JSON.parse(JSON.stringify(input));
                    if (options.className) {
                        className = options.className;
                    }
                    if (options.lineStyle) {
                        lineStyle = options.lineStyle;
                        draw();
                    }
                    if (options.lineColor) {
                        lineColor = options.lineColor;
                    }
                    if (options.handleColor) {
                        handleColor = options.handleColor;
                    }
                    if (options.associationMode) {
                        let unicityTokenA = '';
                        let unicityTokenB = '';
                        let formerAssociation = associationMode;
                        associationMode = options.associationMode;
                        if (associationMode == 'oneToOne' && formerAssociation == 'manyToMany') {
                            let unicityDict = {};
                            for (var i = linksByName.length - 1; i >= 0; i--) {
                                unicityTokenA = linksByName[i].tables + '_A_' + linksByName[i]['from'];
                                unicityTokenB = linksByName[i].tables + '_B_' + linksByName[i]['to'];
                                let doDelete = false;
                                if (!unicityDict[unicityTokenA]) {
                                    unicityDict[unicityTokenA] = true;
                                } else {
                                    doDelete = true;
                                }
                                if (!unicityDict[unicityTokenB]) {
                                    unicityDict[unicityTokenB] = true;
                                } else {
                                    doDelete = true;
                                }
                                if (doDelete) {
                                    linksByName.splice(i, 1);
                                }
                            }
                        }
                    }
                }
                draw();
            }
        } else if (action == 'disable') {
            isDisabled = true;
            $(factory)
                .find('.eraseLink')
                .prop('disabled', isDisabled);
            $(factory)
                .find('li')
                .addClass('inactive');
            $(factory)
                .find('select')
                .prop('disabled', isDisabled);
            globalAlpha = 0.5;
            draw();
            return (that);
        } else if (action == 'enable') {
            isDisabled = false;
            $(factory)
                .find('.eraseLink')
                .prop('disabled', isDisabled);
            $(factory)
                .find('li')
                .removeClass('inactive');
            $(factory)
                .find('select')
                .prop('disabled', isDisabled);
            globalAlpha = 1;
            draw();
            return (factory);
        } else {
            onError = true;
            console.log(errMsg + 'no action parameter provided (param 1)');
        }
    };
}(jQuery));

function LM_allowDrop(ev) {
    ev.preventDefault();
}

function LM_drag(ev) {
    let $target = $(ev.target);
    let data = {};
    data.name = $target.parent().attr('data-name');
    data.col = $target.parent().parent().attr('data-col');
    data.offset = $target.parent().attr('data-offset');
    ev.dataTransfer.setData('text/plain', JSON.stringify({
        'data': data
    }));
}

function LM_drop(ev) {
    ev.preventDefault();
    let src = JSON.parse(ev.dataTransfer.getData('text'));
    if (src) {
        src = src.data;
    }
    let $target = $(ev.target);
    let dest = {};
    dest.name = $target.parent().attr('data-name');
    dest.col = $target.parent().parent().attr('data-col');
    dest.offset = $target.parent().attr('data-offset');
    if (src.col == dest.col && src.offset != dest.offset && src.name != dest.name) {
        FL_Factory_Lists.Lists.forEach(function (x) {
            if (x.name == src.col) {
                let indexA = x.list.indexOf(src.name);
                let indexB = x.list.indexOf(dest.name);
                if (indexA != -1 && indexB != -1) {
                    let temp = x.list[indexA];
                    x.list[indexA] = x.list[indexB];
                    x.list[indexB] = temp;
                }
            }
        });
        $('body').trigger('LM_Message_Redraw');
    }
}

function is_touch_device() { // from bolmaster2 - stackoverflow
    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    var mq = function (query) {
        return window.matchMedia(query).matches;
    };

    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
        return true;
    }

    // include the 'heartz' as a way to have a non matching MQ to help terminate the join
    // https://git.io/vznFH
    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
}
