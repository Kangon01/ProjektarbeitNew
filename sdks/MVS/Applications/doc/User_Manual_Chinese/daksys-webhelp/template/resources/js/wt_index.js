// -----------------------------
// index.html 页面基础功能
// 
// document.ready()

//   --监听：iframe 内 鼠标点击事件
//   --绑定按钮事件
// 
// iframe Onload
// 
// 后退操作
// 
// PC端侧边栏：隐藏，展开折叠，目录功能
// 
// 
// 移动端主目录: 展开折叠，目录功能
// 内容搜索
// 
// 从搜索页面跳转
// 正文内搜索结果高亮显示
// 
// 目录搜索
// 
// -----------------------------
console.log("●● wt_index.js");

var FROM_SEARCH_PAGE = false; // 从搜索结果页面跳转 = true
var RESTORE_PAGE = undefined;
// COOKIE 保存期限
var COOKIE_EXPIRES = 365;
// ------------------------
// STORAGE 手册名称ID + 定制的属性组
var STORAGE_HIK_MANUALID_TYPE_ATTR = "";
// STORAGE 手册名称ID + 定制的型号
var STORAGE_HIK_MANUALID_MODEL = "";
// STORAGE 手册名称ID + 章节
var STORAGE_HIK_MANUALID_TOPIC = "";

// -----------------------------
// document.ready()
//   --监听：手指向上滑动
//   --监听：iframe 内 鼠标点击事件
//   --绑定按钮事件
// 
// --- html 的 guid
// --- 高亮 key
// --- 页面跳转
// --- 评价链接
// 
// 
$(document).ready(function () {
	console.log("●●●● index > ready()");
	// STORAGE key
	STORAGE_HIK_MANUALID_TYPE_ATTR = 'HIK_MANUALID_TYPE_ATTR_' + $('#document-id').text();
	STORAGE_HIK_MANUALID_MODEL = "HIK_MANUALID_MODEL_" + $('#document-id').text();
	STORAGE_HIK_MANUALID_TOPIC = "HIK_MANUALID_TOPIC_" + $('#document-id').text();
	// lang
	$('.wt_nav_header').addClass($('#lang').text());
	$('.wt_footer').addClass($('#lang').text());
	$('.wt_menu_page').addClass($('#lang').text());
	
	var actualLocation = window.location.href; 
	var newLocation; 
	if (actualLocation.indexOf('/#')!=-1) {
		console.warning("actualLocation--------")
		newLocation = actualLocation.replace(/\/#/g, "/"); 
		window.location.replace(newLocation); 
	} 
	if (actualLocation.match(/\/index\.(.*)#/gi)!=null) { 
		console.warning("actualLocation----------")
		newLocation = actualLocation.replace(/\/index\.(.*)#/gi, "/"); 
		window.location.replace(newLocation); 
	} 
	
	// 定制窗口初始化隐藏
	$("#div_custom_win").attr('style','z-index: -999;');
	
 	if(isOffLine()){
		// 离线状态，隐藏WPP按钮
		// index:语言切换(wt_header_langue wt_header_langue_mobile)、手机阅读(wt_header_QRcode)
		console.log('●●●●● offline');
		$('.wt_header_langue').hide();
		$('.wt_header_langue_mobile').hide();
		$('.wt_header_QRcode').hide();
		if(!isMobile()){
			// wt_search_content 修改宽度
			$('.wt_search_content').width('calc(100% - 50% - 40px - 110px)');
		}
	}
	
	var storage_guidString = localStorage.getItem(STORAGE_HIK_MANUALID_TOPIC);
	if(storage_guidString) {
		console.log("index.html storage 读取上次保存的目录");
		g_guidArray = storage_guidString.split(',');
		// 过滤目录
		IS_MENU_CUSTOM = true;
		// Menu根据属性条件重新显示
		menuHideAllMenuLi();
		menuShowByGuidDisplayArray();
	}
	
	// --- html 的 guid
	var guid_html = getParameter('guid');
	if(guid_html != undefined){
		guid_html = decodeURI(guid_html);
	}
	// --- 高亮 key
	var hl = getParameter('hl');
	
	if (guid_html !== undefined && guid_html !='' && hl != 'undefined' && hl !='') {
		// --------------------
		//从搜索页面跳转 ?
		// --------------------
		console.log("From Search Page:" + guid_html);
		FROM_SEARCH_PAGE = true;
		var frame_src = guid_html + "?hl=" + decodeURIComponent(hl);
		$("#frame_element").attr("src", frame_src);
		//高亮左侧菜单 menu_toc_ul menu_ul
		setMenuActiveByGuid(guid_html);
		
 	} else {
		// --------------------
		console.log("index.html: open first page");
		gotoFirstPage();
	}
	// menu wt_menu_custom_tip
	menuCustomTipDisplay();
	


	// 接收 iframe 内消息
	addEventListener('message', e => {
		var event_href = e.data;	
		if (event.data == 'prevTopic') {
			console.log("●● receive postMessage::" + e.data);
			// 上一章
			gotoPrevTopic();
		} else if(event.data == 'nextTopic'){
			console.log("●● receive postMessage::" + e.data);
			// 下一章
			gotoNextTopic();
		} else if(event.data.key != undefined){
			console.log("●● receive postMessage::" + e.data.key);
			if(event.data.key == 'tblZoom'){
				// 表格 全屏
				openTblZoomWin(event.data.html);
				
			} else if(event.data.key == 'imgZoom'){
				// 图 全屏 (包含热点图)
				openImgZoomWin(event.data.html,
							event.data.naturalWidth, event.data.naturalHeight, 
							event.data.imgWidth, event.data.imgHeight);
				
			} else if(event.data.key == 'imgusemapTip'){
				// 热点图显示 tip
				imgusemapTip(event.data.title, event.data.text);
			}
			
		} else if(event.data == 'mobile_hide_page_nav'){
			// 移动端，隐藏本页导航按钮
			$('.wt_header_page_nav').hide();
			$('.wt_search_content').width('calc(100% - 20px - 24px)');
		
		} else if(event.data == 'mobile_show_page_nav'){
			// 移动端，显示本页导航按钮
			$('.wt_header_page_nav').show();
			$('.wt_search_content').width('calc(100% - 20px - 16px - 20px - 24px)');
			
		} else if(event.data == 'scrollStart'){
			// 滚动开始
			//$('.wt_footer').hide();
			// .wt_content_flex_container 计算高度 ---- 滑动到底部，导致自动滚动，不停闪烁
			//$('.wt_content_flex_container').attr('style','height: 98%;');
		} else if(event.data == 'scrollStop'){
			// 滚动停止
			//$('.wt_footer').show();
			//$('.wt_content_flex_container').removeAttr('style');	
		
		} else {
			//高亮左侧菜单 wt_menu_page ul_menu
			if(e.data == "gotoFirstPage"){
				console.log("from topic: open index.html" );
				event.preventDefault();
				gotoFirstPage();
			} else if(e.data.lastIndexOf('.html') > 0){
				console.log("from topic: open html" );
				var guid_html;
				var target_id;
				if(e.data.indexOf('#') > -1){
					guid_html = e.data.substring(0, e.data.indexOf('#') );
					target_id = e.data.substring(e.data.indexOf('#') +1);
				} else {
					guid_html = e.data;
				}
				setMenuActiveByGuid(guid_html);
			}
		}
		
		if (event && event.stopPropagation){
			event.stopPropagation();
		} else {
			window.event.cancelBubble = true;
		}
	});
	if($(".wt_menu_page").width() > 200) {
		var buttonText = getLocalization("webhelp.menu.hide");
		$(".collapse_menu_button").attr('title', buttonText);
	} else {
		var buttonText = getLocalization("webhelp.menu.show");
		$(".collapse_menu_button").attr('title', buttonText);
	}
	
	
	/**  增加li_before的点击事件 */
	$('.li_before').unbind('click').bind('click', function(event){
		//console.log("●● li_before click ");
		var liPosition = $('.li_has_children').index($(this).parent().parent());
		if($(this).parent().parent().hasClass('li_close')){
			$(this).parent().parent().removeClass('li_close');
			$(this).parent().parent().addClass('li_open');
			liStatus[liPosition] = 'li_open';
		}else if($(this).parent().parent().hasClass('li_open')){
			$(this).parent().parent().addClass('li_close');
			$(this).parent().parent().removeClass('li_open');
			liStatus[liPosition] = 'li_close';
		}
		event.stopPropagation(); // 阻止事件冒泡
		//$.cookie('li_status', array2str(liStatus), { expires: 7 });
	}); 
	// 放大窗口的点击事件
	$('#div_zoom').on('click', 'a', function(){
		var guid_html = event.target.pathname;
		if(guid_html != undefined){
			//关闭窗口
			btnCloseZoomWin();
			var index_href = guid_html.lastIndexOf('/');
			guid_html = guid_html.substr(index_href + 1);
			if(guid_html == "index.html"){
				console.log("from zoom: open index.html");
				gotoFirstPage();
			} else {
				console.log("from zoom: open html");
				setMenuActiveByGuid(guid_html);
				openInFrame(guid_html);
			}
			event.preventDefault();
		}
    });
	
 });
/* 当页面滚动时，取消输入框自动补齐的Autocomplete功能*/
$(document).scroll(function(){
	$("#textToSearch").autocomplete("close");
});


// -----------------------------
// iframe Onload
// 
// 
var curWwwPath = window.document.location.href;
var pathName = window.document.location.pathname;
var pos = curWwwPath.indexOf(pathName);
var localhostPaht = curWwwPath.substring(0,pos);
var host_address = localhostPaht + pathName;
	
function iframeOnload(){
	//console.log("iframeOnload() & pushHistory");
	if(localhostPaht != "file://"){
		var src = document.getElementById("frame_element").src;
		src = src.substring(host_address.length);
	} else {
		var src = document.getElementById("frame_element").src;
		src = src.substring(src.lastIndexOf("/") + 1);
	}
	pushHistory(src);//src 放入 history
}

function pushHistory(src) {
	//console.log("pushHistory():" + src);
	if(src != ""){
		var state = {
			title: "title", //浏览器忽略此参数
			url: src  //浏览器显示此地址
		};
		window.history.pushState(state, "title", "");//添加浏览历史
	}
}
// -----------------------------
// 后退操作
// 
// 
var curWwwPath = window.document.location.href;
var pathName = window.document.location.pathname;
var pos = curWwwPath.indexOf(pathName);
var localhostPaht = curWwwPath.substring(0,pos);
var host_address = localhostPaht + pathName;
var initSrc;
// 在页面加载完成后 firstTimeLoad 方法会被调用。
window.onload = firstTimeLoad
function firstTimeLoad() {
	console.log("●●●● window.onload & pushHistory ");
	if(document.getElementById("frame_element") == null) {
		return;
	}
    initSrc = document.getElementById("frame_element").src;
	if(localhostPaht != "file://"){
		initSrc = initSrc.substring(host_address.length);
	} else {
		initSrc = initSrc.substring(initSrc.lastIndexOf("/") + 1);
	}
	pushHistory(initSrc);//src 放入 history
}

window.onpopstate = popState;
function popState(event){
	var guid_html = "";
    if(event.state){
		history.go(-1);//后退一步
		guid_html = event.state.url;
		console.log("popState(event): "+guid_html);
    } else {
		//退到初始页面
		document.getElementById("frame_element").src = initSrc;
		guid_html = initSrc;
		console.log("popState 退到初始页面 "+guid_html);
	}
	$(".menu_toc_ul li").removeClass('active');
	//高亮左侧菜单 wt_menu_page ul_menu
	setMenuActiveByGuid(guid_html);
}
/*记录li_has_children的li_open和li_close*/
var liStatus;
if($.cookie('li_status') != null){
	liStatus = str2array($.cookie('li_status'));
	if(liStatus.length == $('.li_has_children').length){
		for(var i = 0; i < $('.li_has_children').length; i++){
			if(liStatus[i] == 'li_open'){
				setLiStatusOpen($('.li_has_children').eq(i));
			}else if(liStatus[i] == 'li_close'){
				setLiStatusClose($('.li_has_children').eq(i));
			}
		}
	}else{
		liStatus = new Array();
		$('.li_has_children').each(function(){
			liStatus.push('li_close');
			setLiStatusClose($(this));
		});
		$.cookie('li_status', array2str(liStatus), { expires: 7 });
	}
}else{
	liStatus = new Array();
	$('.li_has_children').each(function(){
		liStatus.push('li_close');
		setLiStatusClose($(this));
	});
	$.cookie('li_status', array2str(liStatus), { expires: 7 });
}




// -----------------------------
// PC端侧边栏：隐藏，展开折叠，目录功能
// 
//
// 绑定折叠侧边收缩按钮
function menuCollapseClick(){
	if($("#div_menu").width() > 200) {
		// 隐藏菜单
		$("#div_menu").attr('style', 'width: 1px;');
		$("#div_desktop_menu_header").hide();
		$("#ul_menu").hide();
		// 主页面放大
		$(".wt_content_frame").attr('style', 'padding-left: 1px');
		// 按钮位置 & 文字
		var buttonText = getLocalization("webhelp.menu.show");
		$(".collapse_menu_button").attr('title', buttonText);
		$(".collapse_menu_button").attr('style', 'right: -16px;');
		// 按钮箭头
		$(".collapse_menu_button").addClass('collapse_menu_button_expand');
		$(".collapse_menu_button").removeClass('collapse_menu_button_collapse');
		
		// content_box 设置边距
		$('#frame_element')[0].contentWindow.setMiddleViewWideMode('wide');
		
	} else {
		// 恢复菜单
		$("#div_menu").removeAttr('style');
		$("#div_desktop_menu_header").show();
		$("#ul_menu").show();
		// 恢复主页面
		$(".wt_content_frame").removeAttr('style');
		// 按钮位置 & 文字
		var buttonText = getLocalization("webhelp.menu.hide");
		$(".collapse_menu_button").attr('title', buttonText);
		$(".collapse_menu_button").attr('style', 'right: -8px;');
		// 按钮箭头
		$(".collapse_menu_button").addClass('collapse_menu_button_collapse');
		$(".collapse_menu_button").removeClass('collapse_menu_button_expand');
		// content_box 设置边距
		$('#frame_element')[0].contentWindow.setMiddleViewWideMode('');
		
	}
	
}
	
function openTopicInFrame(alink){
	//console.log("menu active");
	$(".menu_toc_ul li").removeClass('active');
	// 当前的li 加 active, 上层li 不加 active
	alink.parents('li').eq(0).addClass('active');
	var href = alink.attr('data-href');
	$("#frame_element").attr("src", href);
	// 关闭移动端目录
	closeMobileMenu();
}
function menuExpand(){
	$('.wt_menu_page').find('li').each(function(){
        //展开
		$(this).removeClass('li_close');
		$(this).addClass('li_open');
    });
	$("#btn_expand").hide();
	$("#btn_expand_mobile").hide();
	$("#btn_collapse").attr("style", "display:inline-block;");
	$("#btn_collapse_mobile").attr("style", "display:inline-block;");
}
function menuCollapse(){
	$('.wt_menu_page').find('li').each(function(){
        //折叠
		$(this).removeClass('li_open');
		$(this).addClass('li_close');
    });
	$("#btn_collapse").hide();
	$("#btn_collapse_mobile").hide();
	$("#btn_expand").attr("style", "display:inline-block;");
	$("#btn_expand_mobile").attr("style", "display:inline-block;");
}

/** 没有被使用 TODO delete */
function isGuidInToc(guid){
	//判断GUID是否存在于TOC中
	for(var i=0; i<$('.menu_toc_ul li').length; i++){
		var a = $('.menu_toc_ul li').eq(i).find("a").eq(0);
		var html_href = a.attr("data-href");
		var data_id = a.attr("data-id");
		if(guid == data_id){
			return true;
		}
	}
	return false;
}

function setMenuActiveByLi(activeLi){
	//先取消激活
	$('.menu_ul .active').each(function(){
		$(this).removeClass('active');
	});
	//激活
	activeLi.addClass('active');
	// 打开父层级
	open_li_ancestor(activeLi);
	// 总高度
	var menuHeight = $('#div_menu').eq(0).height();
	var LI_HEIGHT = 44; // li 高度
	var POSITION_FIRST = 98; // 第一个 LI 默认 position().top
	// 滚动条总长度的 滚动位置
	var menuScrollTop = $('#div_menu_header_ul').eq(0).scrollTop();
	// li 相对位置
	var liPositionTop = $(activeLi).position().top; // 相对于最近的定位父元素
	var liPositionBottom = liPositionTop + LI_HEIGHT;
	console.log($(activeLi).text() + "  liPositionTop: " + liPositionTop);
	//判断是否需要滚动
	if(liPositionBottom > menuHeight ) {
		var menuScrollOffset = liPositionBottom - menuHeight;
		$('#div_menu_header_ul').eq(0).scrollTop(menuScrollTop + menuScrollOffset);
	
	} else if(liPositionTop < POSITION_FIRST) {
		var menuScrollOffset = POSITION_FIRST - liPositionTop;
		$('#div_menu_header_ul').eq(0).scrollTop(menuScrollTop - menuScrollOffset);
	}
	
}


// Menu根据 g_guidArray 重新显示
function menuShowByGuidDisplayArray(){
	console.log("--- Menu 重新显示 ");
	$('.menu_toc_ul li').each(function(){
		var a = $(this).find("a").eq(0);
		var aText = a.text();
		var guid = getAguid(a);
		if(g_guidArray.indexOf(guid) > -1){
			 // 显示
			$(this).removeClass('menu_hide');
			// 显示所有上层节点
			displayAncestorNode($(this));
		}
	});
}
// 显示所有上层节点
function displayAncestorNode(liObject){
	var parentLi = $(liObject).parent().parent();
	if(parentLi.prop("nodeName") == "LI"){
		// 是目录li  显示
		parentLi.removeClass('menu_hide'); //显示
		var a = $(parentLi).find("a").eq(0);
		var guid = getAguid(a);
		// 显示的上层目录也要放入 g_guidArray
		if(g_guidArray.indexOf(guid) == -1){
			g_guidArray.push(guid);
		}
		// 递归显示
		displayAncestorNode(parentLi);
	}
}

/** frame内打开html */
function openInFrame(src) {
	$("#frame_element").attr("src", src);
}

/** 上一章 */
function gotoPrevTopic(){
	var activeLi = $('.menu_ul li.active');
	var prevLi = findPrevLi(activeLi);
	if($(prevLi).length == 1) {
		setMenuActiveByLi(prevLi);
		// 跳转
		var href = $(prevLi).find('a').eq(0).attr('data-href');
		$("#frame_element").attr("src", href);
	} else {
		console.log("没有上一章");
	}
}
function findPrevLi(currLi) {
	if($(currLi).prev().length == 0){
		// 父节点 激活
		var parentLi = currLi.parent().parent();
		if($(parentLi).prop('tagName') == "LI"){
			if(parentLi.hasClass('menu_hide')){
				return findPrevLi(parentLi);
			} else {
				return parentLi;
			}
		} else {
			// 顶层
			return;
		}
		
	} else {
		// 同级上一个
		var prevLi = $(currLi).prev();
		if(prevLi.hasClass('menu_hide')){
			return findPrevLi(prevLi);
		} else {
			var childLis = prevLi.find("ul li:not(.menu_hide)")
			var childCount = $(childLis).length;
			if(childCount > 0){
				// 找子集合中，最后一个
				var lastChildLi = $(childLis).eq(childCount - 1);
				return lastChildLi;
				
			} else {
				// 没有子集合， 激活prevLi
				if(prevLi.hasClass('menu_hide')){
					return findPrevLi(prevLi);
				} else {
					return prevLi;
				}
			}
		}
		
	}
}
function returnParentLastLi(currLi){
	var childLis = currLi.find("ul li")
	var childCount = $(childLis).length;
	if(childCount > 0){
		// 找子集合中，最后一个
		var lastChildLi = $(childLis).eq(childCount - 1);
		return returnParentLastLi(lastChildLi);
	} else {
		// 到达最底层
		return currLi;
		
	}
}

/** 下一章 */
function gotoNextTopic() {
	var activeLi = $('.menu_ul li.active');
	var nextLi = findNextLi(activeLi);
	if($(nextLi).length == 1) {
		setMenuActiveByLi(nextLi);
		// 跳转
		var href = $(nextLi).find('a').eq(0).attr('data-href');
		$("#frame_element").attr("src", href);
	} else {
		console.log("没有下一章");
	}
	
}
function findNextLi(currLi) {
	var childUl = currLi.find("ul")
	if(childUl.length > 0){
		// 子 第一个 激活
		var nextLi = childUl.find('li').eq(0);
		if(nextLi.hasClass('menu_hide')){
			return findNextLi(nextLi);
		} else {
			return nextLi;
		}
		
	} else if($(currLi).next().length == 1){
		// 同级下一个 激活
		var nextLi = $(currLi).next();
		if(nextLi.hasClass('menu_hide')){
			return findNextLi(nextLi);
		} else {
			return nextLi;
		}
		
	} else {
		// 返回上一层寻找同层
		var parentLi = returnParentNextLi(currLi);
		if($(parentLi).length == 1){
			if(parentLi.hasClass('menu_hide')){
				return findNextLi(parentLi);
			} else {
				return parentLi;
			}
			// 激活 parentLi
			return parentLi;
		} else {
			return;
		}
	}
}
function returnParentNextLi(currLi){
	if($(currLi).parents('li').length == 0){
		// 到达顶层了
		return;
	} else {
		var parentLi = $(currLi).parents('li').eq(0);
		if($(parentLi).next().length == 1){
			// 有下一个同层，返回
			return $(parentLi).next();
		} else {
			// 返回上一层寻找同层
			return returnParentNextLi(parentLi);
		}
	}
}





/* 打开上层菜单 */
function open_li_ancestor(liNode){
	var parent_li = liNode.parent().parent();
	if(parent_li[0].nodeName == "LI"){
		parent_li.removeClass('li_close');
		parent_li.addClass('li_open');
		open_li_ancestor(parent_li);
	}
}



function setLiStatusOpen(obj){
	obj.removeClass('li_close');
	obj.addClass('li_open');
}
function setLiStatusClose(obj){
	obj.removeClass('li_open');
	obj.addClass('li_close');
}
function array2str(array){
	var str = "";
	for(var i = 0; i < array.length; i++){
		if(i != array.length - 1){
			str = str + array[i] + "-";
		}else{
			str = str + array[i];
		}
	}
	return str;
}
function str2array(str){
	var array = new Array();
	for(var i = 0; i < str.split('-').length; i++){
		array.push(str.split('-')[i]);
	}
	return array;
}



function displayMobileMainToc(){
	// index.html页面重新显示主目录
	console.log("重新显示主目录");
	$('.container_mobile').show();
	$("#mobile_menu").show();
	//显示空页面
	$("#frame_mobile").attr("src", "");
	$("#frame_mobile").hide();;
}

function gotoFirstPage(){
	// index.html页面跳转到第一个topic
	//先取消激活
	$('.active').each(function(){
		$(this).removeClass('active');
	});
	var liArray = $('.menu_toc_ul').find('li:not(.menu_hide)');
	if(liArray.length > 0){
		var activeLi = liArray.eq(0);
		var a = $(activeLi).find('a').eq(0);
		if(a.attr('data-href') != null && a.attr('data-href') != ''){
			if($("#frame_element").attr('src') == a.attr('data-href')){
				// 已经是当前页面，滚动到顶部
				$("#frame_element")[0].contentWindow.scrollTopicTop();
			} else {
				$("#frame_element").attr("src", a.attr('data-href'));
				//激活状态
				activeLi.addClass('active');
				open_li_ancestor(activeLi);
				//滚动到目录顶部
				$('#div_menu_header_ul').eq(0).scrollTop(0);
				
				//清空历史记录
				var state = {
					title: "title", //浏览器忽略此参数
					url: ""  //浏览器显示此地址
				};
				window.history.replaceState(state, "title", "");
				pushHistory(a.attr('data-href') );//data-href 放入 history
			}
			
		} else {
			//显示空页面
			$("#frame_element").attr("src", "");
		}
	} else {
		//显示空页面
		$("#frame_element").attr("src", "");
	}
}

function setMenuActiveByGuid(guid_html){
	//先取消激活
	$('.active').each(function(){
		$(this).removeClass('active');
	});
	// 转码
	var decode_html = decodeURIComponent(guid_html);
	$('.wt_menu_page li').each(function(){
		var a = $(this).find("a").eq(0);
		if(a.attr('data-href') != null && (a.attr('data-href') == guid_html || a.attr('data-href') == decode_html)){
			var activeLi = a.parent();
			//激活
			activeLi.addClass('active');
			open_li_ancestor(activeLi);
			// PC:判断是否需要滚动
			var menuHeight = $('#div_menu_header_ul').eq(0).height();
			var menuScrollTop = $('#div_menu_header_ul').eq(0).scrollTop();
			var liOffsetTop = $(this).offset().top;
			// 目录搜索框下边框 位置 menuOffsetTop = 150
			var menuOffsetTop = $('#div_menu_header_ul').eq(0).offset().top;
			if (menuHeight < liOffsetTop) {
				$('#div_menu_header_ul').eq(0).scrollTop(menuScrollTop + liOffsetTop - 150);
			} else if(liOffsetTop < menuOffsetTop){
				$('#div_menu_header_ul').eq(0).scrollTop(menuScrollTop + liOffsetTop - 150);
			}
			// Mobile：因为目录是隐藏的，各坐标为0
		}
	});
}
//设定高度
function setContentAreaHeight(){
	// 等待页面动态效果完成
	setTimeout(function(){
		var bodywrapper_height = $('.bodywrapper').height();
		var footer_height = '35px';
		var content_area_height = 'calc(100% - '+bodywrapper_height+'px - '+footer_height+')';
		$('#content_area').css("height", content_area_height);
		console.log("--- 设定高度 height = " + content_area_height);
		
	}, 300); //500毫秒后执行
	
}
function getShotType(attrType){
	var shortType = attrType.substr(1);
	return shortType;
}

// 取得 li 的GUID ,从  data-id 或者 data-href
function getAguid(a){
	var guid = a.attr("data-id") == undefined ? "" : a.attr("data-id");
	if(guid == ""){
		// 从 data-href 取得 guid 
		guid = a.attr("data-href") == undefined ? "" : a.attr("data-href");
		guid = guid.substr(0, guid.lastIndexOf("."));
	}
	if(guid == ""){
		console.error("●●●●●●[Error]目录[" + a.text() + "]标签缺少GUID");
	}
	return guid;
}

function getParameter(parameter) {
    var whLocation = "";
    try {
        whLocation = window.location;
        var p = parseUri(whLocation);
    } catch (e) {
        debug(e);
    }
    return p.queryKey[parameter];
}


// 搜索之前保存打开页面
function beforeSearchSubmit(){
	if( $('#textToSearch').val() == ''){
		return false;
	} else {
		console.log('save current html guid');
		var host = window.location.href;
		var html = $('#frame_element').attr('src');
		sessionStorage.setItem(RESTORE_PAGE, html);
		return true;
	}
}
/**
 * @description Log messages and objects value into browser console
 */
function debug(message, object) {
    object = object || "";
    console.log(message, object);
}


function clickQRcode() {
	console.log("---- 删除 cookie -----");
	$.removeCookie(COOKIE_HIK_MANUAL);
}

// 目录：显示 wt_menu_custom_tip
function menuCustomTipDisplay(){
	if(IS_MENU_CUSTOM){
		$('.wt_menu_custom_tip').show();
		// div_menu_header_ul 计算高度 
		$('#div_menu_header_ul').height("calc(100% - 18px - 66px - 48px)");
	} else {
		$('.wt_menu_custom_tip').hide();
		// div_menu_header_ul 计算高度 
		$('#div_menu_header_ul').height("calc(100% - 18px - 66px)");
	}
}

function getLang(){
	if($('#lang').text().toLowerCase().indexOf('zh') > -1 &&  $('#lang').text().toLowerCase().indexOf('cn')){
		return true;
	} else {
		return false;
	}
}

function isOffLine(){
	const href = window.location.href;
	if(href.includes('file')){
		return true;
	}
	return false;
}
function isMobile(){
	if($(window).width() <= TOPIC_MAX_WIDTH){
		// 移动端 表不需要放大
		return true;
	}
	return false;
}