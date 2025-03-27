// -----------------------------
// index.html 页面模块功能 -- mobile
// 
// document.ready()
//   --监听：手指向上滑动
//   --
// 
// 移动端：目录导航
// 
// 
// 移动端主目录: 展开折叠，目录功能
// 
// 
console.log("●● wt_index_m.js");


// -----------------------------
// document.ready()
//

$(document).ready(function () {
	console.log("●●●● index mobile > ready()");
	
    var isTouchEnabled = false;
    try {
        if (document.createEvent("TouchEvent")) {
           isTouchEnabled = true;
        }
    } catch (e) {
        //debug(e);
    }
	// 接收 iframe 内消息
	addEventListener('message', e => {
		// 都在 wt_index.js 中处理
	});
	
	
});

// -----------------------------
// document.addEventListener()
// --- 监听窗口的滚动事件
//
//
var startX, startY;  
document.addEventListener('touchstart', function(ev){
    startX = ev.touches[0].pageX;
    startY = ev.touches[0].pageY;
}, false);
document.addEventListener('touchend',function (ev) {  
    var endX, endY;  
    endX = ev.changedTouches[0].pageX;  
    endY = ev.changedTouches[0].pageY;  
    var direction = getSlideDirection(startX, startY, endX, endY);
    switch(direction){
        case 0:
            break;
        case 1:
            // 手指向上滑动
            var scrollTop = 0;
            var scrollTimer = setInterval(function(){
				if(scrollTop != $(document).scrollTop()){
					scrollTop = $(document).scrollTop();
				}else{
					scrollTop = $(document).scrollTop();
					clearInterval(scrollTimer);
					// 以下样式没有被使用 窗口滑动隐藏
					if($(document).scrollTop() > 60){
		            	$('.hikwt_header').css('display', 'none');
		            	$('.wt_main_page_search').css('display', 'none');
		            	$('.hikwt_search_input').css('display', 'none');
		            }
				}
			}, 50);
            break;
        case 2:
            // 手指向下滑动
            var scrollTop = 0;
            var scrollTimer = setInterval(function(){
				if(scrollTop != $(document).scrollTop()){
					scrollTop = $(document).scrollTop();
				}else{
					scrollTop = $(document).scrollTop();
					clearInterval(scrollTimer);
					// 以下样式没有被使用
					if($(document).scrollTop() <= 60){
		            	$('.hikwt_header').css('display', 'block');
		            	$('.wt_main_page_search').css('display', 'block');
		            	$('.hikwt_search_input').css('display', 'block');
		            }
				}
			}, 50);
            break;
		case 3:
			//向右滑动
			break;
		case 4:
			//向左滑动
			break;
    }
}, false);
function getSlideDirection(startX, startY, endX, endY) {  
    var dy = startY - endY;  
    var dx = endX - startX;  
    var result = 0; 
    if(dy > 0){//向上滑动
        return 1;
    }else{//向下滑动
        return 2;
    }
    if(dx > 0){//向右滑动
    	return 3;
    }else{//向左滑动
    	return 4;
    } 
}




// -----------------------------
// 移动端主目录: 显示，关闭
//
function openMobileMenu(){
	// wt_main_page 不隐藏，放在底层
	//$(".wt_main_menu").show();
	$(".wt_menu_page").addClass('menu_show');
	// 隐藏 footer
	$(".wt_footer").hide();
	$(".wt_footer_mobile").hide();
	// mobile_menu_custom_tip  定制状态消息提示
	menuCustomTipDisplayMobile();
	
	// 滚动到目录激活章节位置
	if($('#div_menu_header_ul .active').length != 0){
		var liOffsetTop = $('#div_menu_header_ul .active').offset().top;
		var menuHeight = $('#div_menu_header_ul').eq(0).height();
		var menuScrollTop = $('#div_menu_header_ul').eq(0).scrollTop();
		// 目录搜索框下边框 位置 menuOffsetTop = 106
		var menuOffsetTop = $('#div_menu_header_ul').eq(0).offset().top;
		if (menuHeight < liOffsetTop) {
			$('#div_menu_header_ul').eq(0).scrollTop(menuScrollTop + liOffsetTop - 106);
		} else if(liOffsetTop < menuOffsetTop){
			$('#div_menu_header_ul').eq(0).scrollTop(menuScrollTop + liOffsetTop - 106);
		}
	}
	
}
function closeMobileMenu(){
	$(".wt_menu_page").removeClass('menu_show');
	$(".wt_footer").show();
	$(".wt_footer_mobile").show();
}

// 打开本页导航
function openTopicAnchorList() {
	if ($('#frame_element').contents().find('.right_guide').find('li').length > 0) {
		console.log("打开本页导航");
		// 清空 目录导航
		$('.wt_footer_mobile_anchor_list').html("");
		$('.wt_footer_mobile_anchor_container').removeClass('hidden');
		// header(wt_footer_mobile_anchor_header) : feature_guide
		var headerText = $('#frame_element').contents().find('.feature_guide').children('div').text();
		$('.wt_footer_mobile_anchor_header').children('span').eq(0).text(headerText);
		// list 
		$.each($('#frame_element').contents().find('.right_guide').find('li'), function(i, ele) {
			if ($(ele).hasClass('active')) {
				var anchor_item = $('<div></div>');
				anchor_item.addClass('wt_anchor_item')
				.addClass('active')
				.attr('data-id', $(ele).attr('data-id'))
				.attr('onclick', 'locationTopicAnchor($(this))')
				.html($(ele).html());
				$('.wt_footer_mobile_anchor_list').append(anchor_item);
			} else {
				var anchor_item = $('<div></div>');
				anchor_item.addClass('wt_anchor_item')
				.attr('data-id', $(ele).attr('data-id'))
				.attr('onclick', 'locationTopicAnchor($(this))')
				.html($(ele).html())
				$('.wt_footer_mobile_anchor_list').append(anchor_item);
			}
		});
		// 滚动到active
		var activeItemTop = $('.wt_footer_mobile_anchor_list .active').position().top;
		var listHeight = $('.wt_footer_mobile_anchor_list').height();
		if(activeItemTop > listHeight) {
			$('.wt_footer_mobile_anchor_list').scrollTop(activeItemTop);
		} else if(activeItemTop < 0){
			$('.wt_footer_mobile_anchor_list').scrollTop(0);
		}
		
	} else {
		// 显示提示消息
		toastr.options = {
            closeButton: false,  
            debug: false,  
            progressBar: false,  
            positionClass: "toast-center-center",  
            onclick: null,  
            showDuration: "300",  
            hideDuration: "1000",  
            timeOut: "2000",  
            extendedTimeOut: "1000",  
            showEasing: "swing",  
            hideEasing: "linear",  
            showMethod: "fadeIn",  
            hideMethod: "fadeOut"  
        };
		var noAnchorText;
		if(getLang()){
			noAnchorText = getLocalization("webhelp.anchor.noanchor");
		} else {
			noAnchorText = getLocalization("webhelp.anchor.noanchor.en");
		}
		toastr.info(noAnchorText);
		
	}
}
// 关闭目录导航
function closeLocationTopic() {
	$('.wt_footer_mobile_anchor_container').addClass('hidden');
}
// 定位到topic 的锚点
function locationTopicAnchor(obj) {
	obj.siblings().removeClass('active');
	obj.addClass('active');
	$('.wt_footer_mobile_anchor_container').addClass('hidden');
	// 页面滚动 调用 topic.js 函数
	document.getElementById("frame_element").contentWindow.locationTopicAnchor(obj);
}

// 热点图 显示 tip
function imgusemapTip(title, text){
	// 清空 目录导航
	$('.wt_footer_mobile_anchor_list').html("");
	// 显示
	$('.wt_footer_mobile_anchor_container').removeClass('hidden');
	// wt_footer_mobile_anchor_header > span  
	$('.wt_footer_mobile_anchor_header').children('span').eq(0).text(title);
	// wt_footer_mobile_anchor_list
                // alt 内容 分行处理
                var altArray = text.split('\\n');
	var divObject = $('<div></div>');
	for(var i=0; i< altArray.length; i++){
                         divObject.append("<div>" + altArray[i] + "</div>");
	}

	divObject.addClass('wt_img_usemap_text');
	$('.wt_footer_mobile_anchor_list').append(divObject);

}

// 目录：显示 mobile_menu_custom_tip
function menuCustomTipDisplayMobile(){
	if(IS_MENU_CUSTOM){
		$('.mobile_menu_custom_tip').show();
		// div_menu_header_ul 计算高度 
		$('#div_menu_header_ul').height("calc(100% - 18px - 66px - 48px - 46px)");
	} else {
		$('.mobile_menu_custom_tip').hide();
		// div_menu_header_ul 计算高度 
		$('#div_menu_header_ul').height("calc(100% - 18px - 66px - 48px)");
	}
}
