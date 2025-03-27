
console.log("●● menu_search.js");

var HIGH_LIGHTED = false;
/**
 * 
 */
$(document).ready(function () {
    /* menuSearch 绑定键盘事件 */
	$('#menuSearch').on('keyup', function(event) {
		if (event.key === 'Enter' || event.keyCode === 13) {
			// 回车 Enter
            menusearchQuery();
			
		} else if($("#menuSearch").val() == ""){
			menusearchClean("");
			$('.menu_toc_ul').removeHighlight();
			HIGH_LIGHTED = false;
		
        } else if(event.keyCode === 8 || event.keyCode === 46) {
			// 退格 BackSpace
			menusearchClean($("#menuSearch").val());
			$('.menu_toc_ul').removeHighlight();
			HIGH_LIGHTED = false;
		}
	});
	
	/* menuSearch Mobile 绑定键盘事件 */
	$('#menuSearchMobile').on('keyup', function(event) {
		if (event.key === 'Enter' || event.keyCode === 13) {
			// 回车 Enter
            menusearchQuery();
			
		} else if($("#menuSearchMobile").val() == ""){
			menusearchClean($("#menuSearchMobile").val());
			$('.menu_toc_ul').removeHighlight();
			HIGH_LIGHTED = false;
			
        } else if(event.keyCode === 8 || event.keyCode === 46) {
			// 退格 BackSpace
			menusearchClean($("#menuSearchMobile").val());
			$('.menu_toc_ul').removeHighlight();
			HIGH_LIGHTED = false;

		}
	});
	
});

/**
 * 目录内搜索
 * 
 * 
 */
function menusearchQuery() {
    var input = $("#menuSearch").val().toLowerCase(); 
	console.log('TOC Search:' + input);
	if(input == ""){
		// 根据定制规则，显示全部
		menusearchClean(input);
	} else {
		// 根据搜索KEY ,显示目录
		$('.menu_toc_ul li:not(.menu_hide)').each(function(){
			var a = $(this).find("a").eq(0);
			var aText = a.text();
			if(aText.toLowerCase().indexOf(input) == -1){
				// 隐藏
				$(this).addClass('menu_hide');
			} else {
				// 不隐藏的项目 需要打开可能被隐藏的所有上层节点
				openAncestorNode($(this));
			}
		});
		highlightToc(input);
	}
	// 显示第一个topic
	console.log("search: open first page");
	gotoFirstPage();
}
function menusearchQueryMobile(){
	var input = $("#menuSearchMobile").val().toLowerCase();
	console.log('Mobile TOC Search:' + input);
	// 根据定制规则，显示全部
	if(input == ""){
		// 根据定制规则，显示全部
		menusearchClean(input);
	} else {
		$('.menu_toc_ul li:not(.menu_hide)').each(function(){
			var a = $(this).find("a").eq(0);
			var aText = a.text();
			if (aText.toLowerCase().indexOf(input) == -1){
				// 隐藏
				$(this).addClass('menu_hide');
			} else {
				// 不隐藏的项目 需要打开可能被隐藏的所有上层节点
				openAncestorNode($(this));
			}
		});
		// PC / Mobile 使用同一个 menu_toc_ul
		highlightToc(input);
	}
	// 显示第一个topic
	console.log("search mobile: open first page");
	gotoFirstPage();
}
 
// 显示全部
function menusearchClean(searchText){
	console.log('Menu Search Clean:' + searchText);
	if(searchText == ""){
		if (IS_MENU_CUSTOM) {
			console.log("定制状态，显示定制目录");
			// Menu根据属性条件重新显示
			menuHideAllMenuLi();
			menuShowByGuidDisplayArray();
		} else {
			//显示全部
			menuShowAllMenuLi();
		}
		// 显示第一个topic
		console.log("search clean: open first page");
		gotoFirstPage();
	}
}
// 显示所有上层节点 并展开
function openAncestorNode(liObject){
	var parentLi = $(liObject).parent().parent();
	if(parentLi.prop("nodeName") == "LI"){
		// 是目录li  显示 & 展开
		parentLi.removeClass('menu_hide');
		parentLi.addClass('li_open');
		// 递归显示
		openAncestorNode(parentLi);
	}
}

function highlightToc(input){
	if (HIGH_LIGHTED) {
        return;
    }
	console.log('TOC High Light');
	try {
		var $menu = $('.menu_toc_ul');
        if (typeof $menu.removeHighlight != 'undefined') {
            $menu.removeHighlight();
			//高亮关键字
            if (input != undefined) {
                var jsonString = decodeURIComponent(String(input));
                if (jsonString !== undefined && jsonString != "") {
                    var words = jsonString.split(',');
                    for (var i = 0; i < words.length; i++) {
                        $menu.highlight(words[i]);
                    }
                }
            }
        } 
		
	} catch (e) {
        console.log (e);
    }
	HIGH_LIGHTED = true;
}
