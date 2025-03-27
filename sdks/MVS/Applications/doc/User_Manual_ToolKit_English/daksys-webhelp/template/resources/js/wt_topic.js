
console.log("●● topic.js");


var highlighted = false;
var HTML_LANG;
var HIGH_LIGHTED = false;
// 当前激活的 right guid id
var RIGHT_GUID_ACTIVE_ID;
var RIGHT_GUID_CLICK_ID;
// TOPIC页面宽度 768 为PC模式
var TOPIC_MAX_WIDTH = 768;
// 页面滚动用
var scrollTimeout = null;
// 轮播图固定尺寸 1920 * 1080
var CAROUSEL_MAX_WIDTH = 1920;
var CAROUSEL_MAX_HEIGHT = 1080;

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
	console.log("●●●● topic > ready()");
	var isTouchEnabled = false;
    try {
        if (document.createEvent("TouchEvent")) {
           isTouchEnabled = true;
        }
    } catch (e) {
        //debug(e);
    }
	// table row fixed : copy thead
	$('.wt_table_rowfixed').each(function(){
		var tblEle = $(this).next();
		if(tblEle.length > 0){
			var thead = $(tblEle).find('thead');
			if(thead.length == 1){
				var thead_clone = $(thead).clone();
				$(this).append(thead_clone);
			}
		}
	});
	
	
	// 点击事件
	addEventListener("click", function (event) {
		// 点击 面包屑， 内部引用链接 <a>
		var target = event.target || event.srcElement;      // 兼容处理
		// 判断是否匹配目标元素 a  area 
		if (target.nodeName === "A" 
			|| target.nodeName === "AREA") {    
			if (event.preventDefault) {
				var guid_html = event.target.pathname;
				if(guid_html != undefined){
					console.log("●● topic post message ")
					var index_href = guid_html.lastIndexOf('/');
					guid_html = guid_html.substr(index_href + 1);
					window.parent.postMessage(guid_html, '*');
				}
			} else {
				window.event.returnValue = true;
			}
		}
	}.bind(this));
	// 滚动事件
	$(window).scroll(pageScrollEvent);


	if(isOffLine()){
		// 离线状态，隐藏WPP按钮
		// topic:[点赞、阅读量、分享](wt_topic_wpp_content)、反馈悬浮(body_feedback)
		// topic:Mobile:[点赞、阅读量](body_wpp)
		console.log('●●●●● offline');
		if(!isMobile()){
			$('.wt_topic_wpp_content').hide();
		} else {
			$('.body_wpp').hide();
		}
		$('.body_feedback').hide();
		// h1.title 修改宽度
		$('h1.title').width('auto');
	}
	// 高亮	不需要高亮
	// highlightSearchTerm();

})

function topicOnload(){
	HTML_LANG = $('#lang')[0].outerText;
	// 高亮搜索文字  -- 不需要高亮
	if (!highlighted) {
        // highlightSearchTerm();
    }
	// 是否有可导航项目  
	if($('.feature_guide').length > 0){
		// 激活第一个  right_guide 
		if($(".feature_guide .active").length == 0){
			$(".feature_guide li").eq(0).addClass('active');
		}
		if(isMobile()){
			// 显示 Mobile wt_header_page_nav postmessage
			window.parent.postMessage('mobile_show_page_nav', '*');
		}
	} else {
		if(isMobile()){
			// 隐藏Mobile wt_header_page_nav postmessage
			window.parent.postMessage('mobile_hide_page_nav', '*');
		}
	}

	// video
	videoResize();
	// 图片缩放
	imgResize();
	// 热点图坐标缩放 根据宽度计算
	imgMapResize();
	// 热点图 设定闪烁点
	imgMapAddSpot();
	// 热点图 area 绑定事件 -- 只点击 闪烁点 有响应， area 不需要
	//imgMapAreaOnClick();

	// 表zoom 计算坐标
	addTableZoom();
	// 图bingd 放大函数
	$(".image").on('click', function() {
		// image map
		if($(this).hasClass('image_usemap')){
			// 热点图
			var figObject = $(this).parent();
			imgZoom($(figObject));
		} else {
			imgZoom($(this));
		}
	});
	
	//水印文字
	var mark_text = $("#Trademark").val();
	if(mark_text != ""){
		setTimeout( function() {
			if(navigator.appName == "Microsoft Internet Explorer"&& navigator.appVersion.match(/11./i)!="11."){
				waterMark$(mark_text);
			} else {
				waterMarkNotIe$(mark_text);
			}
		}, 500);
	}
	
	// 轮播图
	$('.fig.fignone.carousel.slide').each(function(){
		var figCarousel_id = $(this).attr('id');
		var id = figCarousel_id.substring(figCarousel_id.indexOf('_') + 1);
		// 轮播图高度
		setFigCarouselHeight(id)
		// 图片轮播--自动滚动到当前文字位置
		setFigCarouselText(id);
	});
		
	
	
	// 计算面包屑 折叠
	calcBreadcrumbDisplayStyle();
	
}
// on resize
window.onresize = function(){
	// console.log("on resize");
	//水印文字
	var mark_text = $("#Trademark").val();
	if(mark_text != ""){
		//删除水印
		$(".cover-Blink-area").remove();
		//添加水印
		if(navigator.appName == "Microsoft Internet Explorer"&& navigator.appVersion.match(/11./i)!="11."){
			waterMark$(mark_text);
		} else {
			waterMarkNotIe$(mark_text);
		}
	}
	
	// 表zoom 计算坐标
	reCalcTableZoom();
	// 热点图坐标缩放 根据宽度计算
	imgMapResize();
	// 热点图 设定闪烁点
	imgMapAddSpot();
	
	// 轮播图
	$('.fig.fignone.carousel.slide').each(function(){
		var figCarousel_id = $(this).attr('id');
		var id = figCarousel_id.substring(figCarousel_id.indexOf('_') + 1);
		// 轮播图高度
		setFigCarouselHeight(id);
	});
}

/*当页面滚动时，取消输入框自动补齐的Autocomplete功能*/
/* $(document).scroll(function(){
	$("#textToSearch").autocomplete("close");
});
*/
function setFigCarouselText(id){
	// 图片轮播
	if($('#figCarousel_' + id).length > 0){
		// 图片轮播事件
		$('#figCarousel_' + id).on('slide.bs.carousel', function (e) {
			// 轮播滑动结束 --自动滚动到当前文字位置
			const index = $(e.relatedTarget).index();
			var figCarousel_index = $(this).attr('id');
			figCarousel_index = figCarousel_index.replace('figCarousel_', '');
			$('#figCarouselContent_' + figCarousel_index).find('.wt_fig_carousel_text_block').removeClass('active');
			$('#figCarouselContent_' + figCarousel_index).find('.wt_fig_carousel_text_block').eq(index).addClass('active');
			// 
			var indicators = $('#figCarouselContent_' + figCarousel_index).find('.wt_fig_carousel_text_indicators');
			var indicatorsScrollTop = indicators.scrollTop();
			var activeBlock = $('#figCarouselContent_' + figCarousel_index).find('.wt_fig_carousel_text_block').eq(index);
			var blockTop = $(activeBlock).position().top; // 相对于最近的定位父元素
			$(indicators).scrollTop(indicatorsScrollTop + blockTop);
		});
		
		// 图片轮播 屏幕滑动事件
		var startX, startY;  
		$('#figCarousel_' + id).on('touchstart', function(event){
			startX = event.touches[0].pageX;
			startY = event.touches[0].pageY;
		});
		$('#figCarousel_' + id).on('touchend', function(event){
			var endX, endY;  
			endX = event.changedTouches[0].pageX;  
			endY = event.changedTouches[0].pageY;  
			var direction = getSlideDirection(startX, startY, endX, endY);
			switch(direction){
				case 0:
					break;
				case 3:
					//向右滑动 
					$(this).find('a.left.carousel-control').click();
					break;
				case 4:
					//向左滑动
					$(this).find('a.right.carousel-control').click();
					break;
			}
		});
	}// 图片轮播 end
	
}


// 表zoom 计算坐标
function addTableZoom(){
	if($(window).width() <= TOPIC_MAX_WIDTH){
		// 移动端 表不需要放大
		return;
	}
	// 表格 动态插入放大按钮 table_zoom  在<table> 后面  点击放大
	$('.div_table').each(function(){
		var tableObj = $(this).find('table[id!="tbl_rowfixed"]');
		$(tableObj).after('<div class="table_zoom" onclick="tblZoom($(this))" />');
		// 取得 table 位置，计算 table_zoom 位置
		var tableWidth = Math.floor($(tableObj).width());
		// 动态计算 table_zoom 位置
		if($(tableObj).attr('class').indexOf('choicetable') > 0){
			console.log('Add ChoiceTable Zoom');
			// choicetable top = choicetable.top 
			var table_top = $(tableObj).position().top;
			table_top = Math.floor(table_top);
			var table_width = Math.floor($(tableObj).width());
			var table_left = $(tableObj).position().left;
			// table: margin-bottom: 12px
			$(tableObj).next().css({
				'top': table_top + 8,
				'left': table_left + table_width - 16
			});
		} else {
			console.log('Add Table Zoom');
			// 普通table top = table.top - caption.height 
			// table:margin-top: 12  caption 上下 padding 16px
			var table_top = $(tableObj).position().top + 12 + ($(tableObj).find('caption').height() + 16 || 0) ; 
			table_top = Math.floor(table_top);
			var table_width = Math.floor($(tableObj).width());
			// table: margin-bottom: 12px
			$(tableObj).next().css({
				'top': table_top - 8,
				'left': table_width - 16
			});
		}
	});
}
// 表zoom 重新计算坐标
function reCalcTableZoom(){
	if($(window).width() <= TOPIC_MAX_WIDTH){
		// 移动端 表不需要放大
		return;
	}
	// 表格 动态插入放大按钮 table_zoom  在<table> 后面  点击放大
	$('.div_table').each(function(){
		var tableObj = $(this).find('table[id!="tbl_rowfixed"]');
		// 取得 table 位置，计算 table_zoom 位置
		var tableWidth = Math.floor($(tableObj).width());
		var tableZoom = $(this).find('.table_zoom');
		// 动态计算 table_zoom 位置
		if($(tableObj).attr('class').indexOf('choicetable') > 0){
			console.log('calc ChoiceTable Zoom');
			// choicetable top = choicetable.top 
			var table_top = $(tableObj).position().top;
			table_top = Math.floor(table_top);
			var table_width = Math.floor($(tableObj).width());
			var table_left = $(tableObj).position().left;
			// table: margin-bottom: 12px
			$(tableZoom).css({
				'top': table_top + 8,
				'left': table_left + table_width - 16
			});
		} else {
			console.log('calc Table Zoom');
			// 普通table top = table.top - caption.height 
			// table:margin-top: 12  caption 上下 padding 16px
			var table_top = $(tableObj).position().top + 12 + ($(tableObj).find('caption').height() + 16 || 0) ; 
			table_top = Math.floor(table_top);
			var table_width = Math.floor($(tableObj).width());
			// table: margin-bottom: 12px
			$(tableZoom).css({
				'top': table_top - 8,
				'left': table_width - 16
			});
		}
		
	});
}

function highlightSearchTerm() {
    try {
        var $body = $('.wh_topic_content');
        var $relatedLinks = $('.wh_related_links');
		var $childLinks = $('.wh_child_links');

        // Test if highlighter library is available
        if (typeof $body.removeHighlight != 'undefined') {
			// console.log("highlightSearchTerm()");
            $body.removeHighlight();
            $relatedLinks.removeHighlight();
			//高亮关键字
            var hlParameter = getParameter('hl');
            if (hlParameter != undefined) {
                var jsonString = decodeURIComponent(String(hlParameter));
                console.log("jsonString: ", jsonString);
                if (jsonString !== undefined && jsonString != "") {
                    var words = jsonString.split(',');
                    for (var i = 0; i < words.length; i++) {
                        console.log('highlight(' + words[i] + ');');
                        $body.highlight(words[i]);
                        $relatedLinks.highlight(words[i]);
                        $childLinks.highlight(words[i]);
                    }
                }
            }
        } else {
            // JQuery highlights library is not loaded
        }
    }
    catch (e) {
        console.log (e);
    }
    highlighted = true;
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


// waterMark:
function waterMark$(watermark){
	console.log("waterMark()");
	$("p[name='p1$']").remove();
	var winwidth$ = document.body.scrollWidth-17;
	var winheight$ = document.body.scrollHeight;
	$("body").append("<p id='waterSum_11' name='p1$' class='cover_through cover js-click-to-alert'>"+watermark+"</p>");
	var fleft = Number($('#waterSum_11').css("margin-left").substring(0,$('#waterSum_11').css("margin-left").indexOf('p')));
	var ftop = Number($('#waterSum_11').css("margin-top").substring(0,$('#waterSum_11').css("margin-top").indexOf('p')));
	var perWidth = $("#waterSum_11").width();
	var perHeight = Number('180px'.substring(0,'180px'.indexOf('p')));
	var lines = parseInt(winwidth$/(perWidth + fleft*2));
	var rows = Math.round(winheight$/perHeight);
	console.log("ROW:" + rows + " winheight:"+winheight$ + " perHeight:" + perHeight);
	var totalPWidth = perWidth*lines;
	var totalSpace = winwidth$-totalPWidth;
	var perSpace = parseInt(totalSpace/(lines+1));
	$('#waterSum_11').css("margin-left",perSpace);
	for(var i=1;i<=rows;i++) {
		for(var j=1;j<=lines;j++){
			if(i==1){
				if(j<=lines-1){
					var p = "<p id='waterSum_"+i+""+(j+1)+"' name='p1$' class='cover_through cover js-click-to-alert'>"+watermark+"</p>";
					var ileft = $('#waterSum_'+i+''+j).css("margin-left").substring(0,$('#waterSum_'+i+''+j).css("margin-left").indexOf('p'));
					var itop = $('#waterSum_11').css("margin-top").substring(0,$('#waterSum_11').css("margin-top").indexOf('p'));
					$("body").append(p);
					$('#waterSum_'+i+''+(j+1)).css("margin-left",Number(ileft)+Number(perWidth)+perSpace);
					$('#waterSum_'+i+''+(j+1)).css('margin-top',itop);
				}
			}else{
				var p = "<p id='waterSum_"+i+""+j+"' name='p1$' class='cover_through cover js-click-to-alert'>"+watermark+"</p>";
				var ileft = $('#waterSum_'+(i-1)+''+j).css("margin-left").substring(0,$('#waterSum_'+(i-1)+''+j).css("margin-left").indexOf('p'));
				var itop =  $('#waterSum_'+(i-1)+''+j).css("margin-top").substring(0,$('#waterSum_'+(i-1)+''+j).css("margin-top").indexOf('p'));
				$("body").append(p);
				$('#waterSum_'+i+''+j).css("margin-left",Number(ileft));
				$('#waterSum_'+i+''+j).css('margin-top',Number(itop)+Number(perHeight));
			}
		}
	}
	passThrough();
	
}
// waterMark:
function waterMarkNotIe$(watermark){
	// console.log("waterMark Not Ie()");
	var winwidth$ = document.body.clientWidth;
	var winheight$ = document.body.scrollHeight;
	var waterSum$ = 200;
	var oldleft$=0;
	var maxI$=0;
	var k$=0;
	$("body").append("<div class='cover-Blink-area'> </div>");
	$('.cover-Blink-area').css('height', winheight$+'px');
	for( var i=1;i<=waterSum$;i++) {
		$(".cover-Blink-area").append("<p id='waterSum_" +i+"' class='cover_through cover-Blink js-click-to-alert'>"+watermark+"</p>");
		var left = Number(document.getElementById("waterSum_" +i).offsetLeft);
		if(left>oldleft$) {
			oldleft$ = left;
			maxI$ = i;
		}
		if (left<oldleft$&&k$==0){
			var top = $("#waterSum_1").css("margin-top").substring(0,$("#waterSum_1").css("margin-top").indexOf('p'));
			var bottom = $("#waterSum_1").css("margin-bottom").substring(0,$("#waterSum_1").css("margin-bottom").indexOf('p'));
			var pHeight = $("#waterSum_1").height();
			var totalHeight = Number(top)+Number(pHeight)+Number(bottom);
			var Hnum = Math.round(winheight$/(totalHeight/1.3));
			waterSum$ = Hnum*maxI$;
			k$++;
		}
	}
}
// waterMark:
function passThrough() {
	$(".cover").mouseenter(function(){
		$(this).stop(true).fadeOut().delay(1500).fadeIn(50);
	});
}

function debug(msg, object){
	console.log(msg, object); 
}


function pageScrollEvent(){
	if($(window).width() <= TOPIC_MAX_WIDTH){
		// Mobile
		window.parent.postMessage('scrollStart', '*');
		if (scrollTimeout) {
			clearTimeout(scrollTimeout);
		}
		scrollTimeout = setTimeout(function() {
			// Mobile: 滚动停止时的处理逻辑
			window.parent.postMessage('scrollStop', '*');
		}, 500); // 可以根据需要调整延迟时间
	}
	
	// 计算 right-fixed-container top 设定 style
	if($(window).scrollTop() < 60) {
		var guidTop = 60 - $(window).scrollTop();
		$(".right_fixed_container").attr("style", "top:" + guidTop + "px;");
	} else {
		// right_guide 置顶显示
		$(".right_fixed_container").attr("style", "top:0px;");
	}
	
	if(RIGHT_GUID_CLICK_ID != undefined){
		// 激活点击的 section
		$(".feature_guide li").removeClass('active');
		$('.feature_guide li[data-id="' + RIGHT_GUID_CLICK_ID + '"]').addClass('active');
		RIGHT_GUID_CLICK_ID = undefined;
	} else {
		// 激活滚动的 section
		var activeSectionId;
		var titleArray = $('h2,h3,h4');
		for(var i = 0; i < titleArray.length; i++){
			var title = titleArray[i];
			var section = $(title).parent();
			if(section == undefined) {
				continue;
			}
			var section_id = $(section).attr('id');
			if(section_id == undefined) {
				continue;
			}
			var sectionTop = $(section).position().top;
			if($(window).scrollTop() > sectionTop){
				// 滚动的 section
				activeSectionId = section_id;
			}
			if(RIGHT_GUID_ACTIVE_ID != activeSectionId){
				$(".feature_guide li").removeClass('active');
				// 激活 section
				$('.feature_guide li[data-id="' + activeSectionId + '"]').addClass('active');
				RIGHT_GUID_ACTIVE_ID = activeSectionId;
			}
		}
	}
	if($(".feature_guide .active").length == 0){
		// right_guide 激活第一个 
		$(".feature_guide li").eq(0).addClass('active');
	}
	
	
	// 表格头部滚动固定显示 table thead fixed
	$('table[id!="tbl_rowfixed"]').each(function(){
		var table_rowfixed = $(this).prev();
		if(table_rowfixed.prop('className') != 'table wt_table_rowfixed'){
			return;
		}
		var tbody = $(this).find('tbody');
		if(tbody == null) {
			return;
		}
		if($(window).scrollTop() > ($(tbody).offset().top + $(tbody).height())) {
			// 超过表格最后行  隐藏
			table_rowfixed.attr("style", "display:none;" );
			
		} else if($(window).scrollTop() > $(tbody).offset().top - 60) {
			// 显示
			table_rowfixed.attr("style", "display:table;" );
			table_rowfixed.attr("style", "width:" + $(tbody).width() + "px!important;");
		} else if($(window).scrollTop() < $(tbody).offset().top - 60){
			// 隐藏
			table_rowfixed.attr("style", "display:none;" );
		}
	});
}
// 本页导航 点击
function scrollToAnchor(target) {
	console.log('Anchor scroll to...');
	$(".feature_guide li").removeClass('active');
	if(target !== undefined) {
		var sectionId = $(target).attr("data-id");
		// 计算位置 激活
		var position = $("#" + sectionId).position();
		if ($(window).width() > TOPIC_MAX_WIDTH) {
			$(window).scrollTop(position.top);
		} else {
			$(window).scrollTop(position.top);
		}
		
		RIGHT_GUID_CLICK_ID = sectionId;
		$(target).addClass('active');
		if ($(window).width() > TOPIC_MAX_WIDTH) {
			// 展开 激活的 & 收缩其他
			$('.wh_expand_btn').each(function(){
				var this_id = $(this).parent().parent().attr("id");
				if(this_id == sectionId){
					// 展开 激活的
					$(this).addClass("expanded");
					$(this).parent().siblings().show();
					// 展开父节点
					expandParentSection($(this).parent().parent());
				} else {
					// 收缩其他 删除此功能
					// $(this).removeClass("expanded");
					// $(this).parent().siblings().hide();
				}
			});
		}
	}
}
// 本页导航 展开父节点
function expandParentSection(divTarget){
	if(divTarget.parent() && divTarget.parent().parent()){
		var parentDiv = divTarget.parent().parent();
		if($(parentDiv).attr('class').indexOf('wt_topic_content body') === -1 ){
			// 第一个是 title
			if($(parentDiv).children().eq(0).hasClass('title')){
				var expand_btn = $(parentDiv).children().eq(0).find('.wh_expand_btn');
				// 展开 激活的
				$(expand_btn).addClass("expanded");
				$(expand_btn).parent().siblings().show();
				//
				expandParentSection($(expand_btn).parent().parent());
			}
		}
	}
}


function videoResize(){
	var videoDom = $('video');
	var i = 0, l = videoDom.length, width, height, className, scale, isSpec;
	for (; i < l; i++) {
		className = videoDom[i].className;
        width = videoDom[i].getAttribute('width');
        height = videoDom[i].getAttribute('height');
		
		var inFigCarousel = $(videoDom[i]).parents('.fig.carousel.slide').length == 0? false: true;
		if(inFigCarousel) {
			// 固定为 CAROUSEL_MAX_WIDTH 内外都设定 CAROUSEL_MAX_WIDTH
			videoDom[i].setAttribute('width', CAROUSEL_MAX_WIDTH + 'px');
			var videoDiv = videoDom[i].parentNode;
			videoDiv.setAttribute('width', CAROUSEL_MAX_WIDTH +'px');
			
		} else if(width) {
            switch (true) {
                case width >= 1417:
                    videoDom[i].setAttribute('width', '900px');
                    videoDom[i].setAttribute('height', '');
                    break;
                case width >= 945 && width < 1417:
                    videoDom[i].setAttribute('width', '600px');
                    videoDom[i].setAttribute('height', '');
                    break;
                case width >= 591 && width < 945:
                    videoDom[i].setAttribute('width', '188px');
                    videoDom[i].setAttribute('height', '');
                    break;
                case width >= 354 && width < 591:
                    videoDom[i].setAttribute('width', '122px');
                    videoDom[i].setAttribute('height', '');
                    break;
                case width >= 0 && width < 354:
                    videoDom[i].setAttribute('width', '75px');
                    videoDom[i].setAttribute('height', '');
                    break;
            }
        }
		
	}
}

function imgResize() {
	var imgDom = $('img.image');
    var i = 0, l = imgDom.length, width, height, className, scale, isSpec;
    for (; i < l; i++) {
        className = imgDom[i].className;
        width = imgDom[i].getAttribute('width');
        height = imgDom[i].getAttribute('height');
        scale = imgDom[i].getAttribute('scale');
        if(className) {
            switch (true) {
                case (className.indexOf('spec_icon') > -1 &&  height == '60'):
                    imgDom[i].setAttribute('height', '600px');
                    imgDom[i].setAttribute('width', ''); /* width is invalid  */
					$(imgDom[i]).show();
					isSpec = true;
                    continue;
                case className.indexOf('spec_icon') > -1:
                    imgDom[i].setAttribute('height', '300px');
                    imgDom[i].setAttribute('width', ''); /* width is invalid  */
					$(imgDom[i]).show();
                    isSpec = true;
                    continue;
                case className.indexOf('bigicon') > -1 && isSpec == true:
                    imgDom[i].setAttribute('height', '80px');
                    imgDom[i].setAttribute('width', '');
					$(imgDom[i]).show();
                    continue;
                case className.indexOf('icon') > -1 && isSpec == true:
                    imgDom[i].setAttribute('height', '80px');
                    imgDom[i].setAttribute('width', '');
					$(imgDom[i]).show();
                    continue;
                case className.indexOf('bigicon') > -1:
                    imgDom[i].setAttribute('height', '40px');
                    imgDom[i].setAttribute('width', '');
					$(imgDom[i]).show();
                    continue;
                case className.indexOf('icon') > -1:
                    imgDom[i].setAttribute('height', '20px');
                    imgDom[i].setAttribute('width', '');
					$(imgDom[i]).show();
                    continue;
            }
			
        }
		var inFigCarousel = $(imgDom[i]).parents('.fig.carousel.slide').length == 0? false: true;
		if(inFigCarousel) {
			// 
			imgDom[i].setAttribute('width', CAROUSEL_MAX_WIDTH + 'px');
			
		} else if(width) {
            switch (true) {
                case width >= 1417:
                    imgDom[i].setAttribute('width', '900px');
                    imgDom[i].setAttribute('height', '');
                    break;
                case width >= 945 && width < 1417:
                    imgDom[i].setAttribute('width', '600px');
                    imgDom[i].setAttribute('height', '');
                    break;
                case width >= 591 && width < 945:
                    imgDom[i].setAttribute('width', '188px');
                    imgDom[i].setAttribute('height', '');
                    break;
                case width >= 354 && width < 591:
                    imgDom[i].setAttribute('width', '122px');
                    imgDom[i].setAttribute('height', '');
                    break;
                case width >= 0 && width < 354:
                    imgDom[i].setAttribute('width', '75px');
                    imgDom[i].setAttribute('height', '');
                    break;
            }
        } else if(height) {
            switch (true) {
                case height >= 2362:
                    if (BrowserDetect.browser=='Firefox' ){
                        imgDom[i].setAttribute('style', 'max-height:750px');
                    } else {
						imgDom[i].style.cssText = "max-height:750px";
					}
                    imgDom[i].setAttribute('height', '');
                    imgDom[i].setAttribute('width', '');
                    break;
                case height >= 1417:
                    if (BrowserDetect.browser=='Firefox' ){
                        imgDom[i].setAttribute('style', 'max-height:600px');
                    } else {
						imgDom[i].style.cssText = "max-height:600px";
					}
                    imgDom[i].setAttribute('height', '');
                    imgDom[i].setAttribute('width', '');
                    break;
                case height >= 945:
					if (BrowserDetect.browser=='Firefox' ){
                        imgDom[i].setAttribute('style', 'max-height:400px');
                    } else {
						imgDom[i].style.cssText = "max-height:400px";
					}
                    imgDom[i].setAttribute('height', '');
                    imgDom[i].setAttribute('width', '');
                    break;
                case height >= 500:
                    if (BrowserDetect.browser=='Firefox' ){
                        imgDom[i].setAttribute('style', 'max-height:160px');
                    } else {
						imgDom[i].style.cssText = "max-height:160px";
					}
                    imgDom[i].setAttribute('height', '');
                    imgDom[i].setAttribute('width', '');
                    break;
                case height >= 119:
                    if (BrowserDetect.browser=='Firefox' ){
                        imgDom[i].setAttribute('style', 'max-height:80px');
                    } else {
						imgDom[i].style.cssText = "max-height:80px";
					}
                    imgDom[i].setAttribute('height', '');
                    imgDom[i].setAttribute('width', '');
                    break;
                case height >= 0:
                    if (BrowserDetect.browser=='Firefox' ){
                        imgDom[i].setAttribute('style', 'max-height:30px');
                    } else {
						imgDom[i].style.cssText = "max-height:30px";
					}
                    imgDom[i].setAttribute('height', '');
                    imgDom[i].setAttribute('width', '');
                    break;
            }
        } else if(scale) {
            imgDom[i].setAttribute('scale', '');
            imgDom[i].setAttribute('height', '');
            imgDom[i].setAttribute('width', scale + '%');
        }
		// 显示图片 
		$(imgDom[i]).show();
    }
    imgDom = null;

}
function imgMapResize(){
	var imgDom = $('img.image_usemap');
    var i = 0, l = imgDom.length, width, height, scale;
    for (; i < l; i++) {
		// 实际显示尺寸
		var width_mobile = $(imgDom[i]).prop('width');
		var height_mobile = $(imgDom[i]).prop('height');
		// 原始尺寸
        naturalWidth = $(imgDom[i]).prop('naturalWidth');
        naturalHeight = $(imgDom[i]).prop('naturalHeight');
        var areaDomList = $(imgDom[i]).next().find('area');
		if(areaDomList.length == 0) {
			continue;
		}
		scale = width_mobile / naturalWidth;
		areaCoordsResize(areaDomList, scale);
    }
    imgDom = null;
}
function areaCoordsResize(areaDomList, scale){
	for(var i=0; i<areaDomList.length; i++){
		var coordsArray = $(areaDomList[i]).attr('data-coords').split(',');
		var newCoordsArray = new Array();
		for(var m=0; m<coordsArray.length; m++){
			newCoordsArray.push( Number(coordsArray[m]) * scale);
		}
		$(areaDomList[i]).attr('coords', newCoordsArray.join(','));
	}
}
// 热点图 设定闪烁点
function imgMapAddSpot(){
	//console.log('imgMap AddSpot');
	// 先删除 spot
	$('.img_spot').each(function(){
		$(this).remove();
	});
	$('img.image_usemap').each(function(){
		var imagemapObj = $(this).parent();
		var mapObj = $(this).next();
		var areaDomList = $(mapObj).find('area');
		for(var i=0; i<areaDomList.length; i++){
			var href = $(areaDomList[i]).attr('data-href');
			var shape = $(areaDomList[i]).attr('shape');
			if(shape  == 'rect'){
				// 计算之后的 coords
				var coordsArray = $(areaDomList[i]).attr('coords').split(',');
				// 中心点 
				var spotX = (Number(coordsArray[0]) + Number(coordsArray[2])) / 2;
				var spotY = (Number(coordsArray[1]) + Number(coordsArray[3])) / 2;
				// 宽高
				var width = Number(coordsArray[2]) - Number(coordsArray[0]);
				var height = Number(coordsArray[3]) - Number(coordsArray[1]);
				// 计算直径 宽高小的
				var diameter = width>height? height: width;
				// insert spot
				if(href.toLowerCase() != 'javascript:void(0);'){
					var aElement = '<a href="' + href + '" '
						+ 'title="' + $(areaDomList[i]).attr('data-title') + '" '
						+ 'id="img_spot' + i +'" class="img_spot" ></a>';
					$(mapObj).after(aElement);
				} else {
					$(mapObj).after('<div id="img_spot' + i +'" class="img_spot" />');
				}
				// 设定位置
				$(mapObj).next().css({
					'top': spotY - 10,
					'left': ($(imagemapObj).width()-$(this).width())/2 + spotX	- 10
				});
			} else if(shape  == 'circle'){
				// 计算之后的 coords
				var coordsArray = $(areaDomList[i]).attr('coords').split(',');
				// 中心点 == 圆心
				var spotX = Number(coordsArray[0]);
				var spotY = Number(coordsArray[1]);
				// 计算直径
				var diameter = Number(coordsArray[2]) * 2;
				// insert spot
				if(href.toLowerCase() != 'javascript:void(0);'){
					var aElement = '<a href="' + href + '" '
						+ 'title="' + $(areaDomList[i]).attr('data-title') + '" '
						+ 'id="img_spot' + i +'" class="img_spot" ></a>';
					$(mapObj).after(aElement);
				} else {
					$(mapObj).after('<div id="img_spot' + i +'" class="img_spot" />');
				}
				// 设定位置
				$(mapObj).next().css({
					'top': spotY - 10,
					'left': ($(imagemapObj).width()-$(this).width())/2 + spotX	- 10
				});
			}
		}
	});
	// spot 绑定事件
	imgMapSpotOnClick();
}

// 热点图 area 绑定事件 -- 只点击 闪烁点 有响应， area 不需要
function imgMapAreaOnClick(){
	if($("area").length > 0){
		$("area").on('click', function(event) {
			if ($(window).width() > TOPIC_MAX_WIDTH) {
				$('#img_usemap_tip').fadeOut(500);
				$(".img_usemap_tip_title").text(event.currentTarget.title);
				$(".img_usemap_tip_text").text(event.currentTarget.alt);
				$('#img_usemap_tip')
				  .css({
					top: event.clientY + 12,
					left: event.clientX + 12
				  })
				.fadeIn('fast');
			} else {
				// Mobile 弹出框  -- 发送到 index 页面显示
				var data = {
					key: 'imgusemapTip',
					title: event.currentTarget.title,
					text: event.currentTarget.alt
				};
				window.parent.postMessage(data, '*');
			}
			
		});
		$('area').mouseout(function(event) {
			// 隐藏tooltip 移动端 不响应此事件
			$('#img_usemap_tip').fadeOut(500);
		});
	}
}

// 热点图 spot 绑定事件
function imgMapSpotOnClick(){
	// spot 绑定 click
	$('div.img_spot').on('click', function(event){
		var index = Number($(event.currentTarget).attr('id').replace('img_spot',''));
		var mapObj = $(this).siblings('map');
		var areaArray = $(mapObj).find('area');
		if ($(window).width() > TOPIC_MAX_WIDTH) {
			$('#img_usemap_tip').fadeOut(500);
			$(".img_usemap_tip_title").text($(areaArray[index]).attr('data-title'));
                                                //$(".img_usemap_tip_text").text($(areaArray[index]).attr('alt'));
			$(".img_usemap_tip_text").empty();
			// alt 内容 分行处理
			var altArray =$(areaArray[index]).attr('alt').split('\\n');
			var divObject = $('<div></div>');
			for(var i=0; i< altArray.length; i++){
				divObject.append("<div>" + altArray[i] + "</div>");
			}
			$(".img_usemap_tip_text").append(divObject);
			$('#img_usemap_tip')
			  .css({
				top: event.clientY + 12,
				left: event.clientX + 12
			  })
			.fadeIn('fast');
			
		} else {
			// Mobile 弹出框  -- 发送到 index 页面显示
			var data = {
				key: 'imgusemapTip',
				title: $(areaArray[index]).attr('data-title'),
				text: $(areaArray[index]).attr('alt')
			};
			window.parent.postMessage(data, '*');
		}
	});
	
	$('.img_spot').mouseout(function(event) {
		// 隐藏tooltip 移动端 不响应此事件
		$('#img_usemap_tip').fadeOut(500);
	});
}

// 轮播图高度
function setFigCarouselHeight(id){
	if($('#figCarousel_' + id).length > 0){
		// 停止轮播
		$('#figCarousel_' + id).carousel({
		  interval: false // 设置为 false 停止自动播放
		})
		
		// figCarousel 设定高度
		var carouselHeight = $('#figCarousel_' + id).width() /16 * 9 + 20;
		$('#figCarousel_' + id).attr('style', 'height:' + carouselHeight + 'px;');
		
		$('#figCarousel_' + id).each(function(){
			// img 高度
			$(this).find('img.image').each(function(){
				var naturalWidth = $(this).prop('naturalWidth');
				var naturalHeight = $(this).prop('naturalHeight');
				//var imgWidth = $(this).width();
				//var imgHeight = $(this).height();
				//var imgPropWidth = $(this).prop('width');
				//var imgPropHeight = $(this).prop('height');
				if((naturalHeight / naturalWidth) > 9/16) {
					$(this).attr('width', '');
					var calcHeight = $('#figCarousel_' + id).height() - 20;
					$(this).attr('style', 'height:' + calcHeight+'px');
				} else {
					//console.log('---');
				}
			});
		});
	
	}
}

function getBreadcrumbWidth() {
	var breadcrumbLiList = $('.wt_breadcrumb').find('li');
	var width = 0;
    for(var i = 0; i < breadcrumbLiList.length; i++){
		var li = breadcrumbLiList[i];
		width += $(li).width();
	}
    return width;
}

function calcBreadcrumbDisplayStyle(){
	// wt_breadcrumb 宽度 -  省略号DIV 宽度（14 + 8）
	var MaxBreadcrumbWidth = $('.wt_breadcrumb').width() - 22;
	var breadcrumbLiList = $('.wt_breadcrumb').find('li');
	if(breadcrumbLiList.length == 0){
		return;
	}
	//console.log('面包屑收缩');
	// 本topic 标题文字 (数组最后一个)
	var curTopicTitleText = $(breadcrumbLiList[breadcrumbLiList.length-1]).text();
	// 第一个隐藏的标题文字
	var hideTopicTitleText;
	var width = 0;//已显示 li 的总宽度
	var displayWidth = 0;
	var hideFlag = false;
    for(var i = 0; i < breadcrumbLiList.length; i++){
		var li = breadcrumbLiList[i];
		width += $(li).width();
		if(width >= (MaxBreadcrumbWidth - 28)){
			if(!hideFlag){
				hideTopicTitleText = $(li).text();
				displayWidth = Math.floor(MaxBreadcrumbWidth - width + $(li).width());
				displayWidth -= 28;
				
			}
			// 隐藏当前之前的 li ，【首页】 不隐藏
			hideFlag = true;
		}
		if(hideFlag){
			$(li).hide();
		}
	}
	if(hideFlag){
		// 截取文字
		// 插入 展开按钮  displayWidth宽度最小 50px
		if(displayWidth < 50) {
			displayWidth = 50;
		}
		var liExpandButton = '<li class="wt_breadcrumb_li_overflow" style="width:' + displayWidth + 'px;">'
		+ '<span>' + hideTopicTitleText + '</span>'
		+ '</li>';
		$('.wt_breadcrumb').find('ol').eq(0).append(liExpandButton);
		$('.wt_breadcrumb_ellipsis').attr("style", "display: inline-block;");
	}
	
}

// 显示全部 面包屑Div
function expandBreadcrumbDiv(){
	var breadcrumbLiList = $('.wt_breadcrumb').find('li');
	for(var i = 0; i < breadcrumbLiList.length; i++){
		var li = breadcrumbLiList[i];
		$(li).show();
		if($(li).hasClass('wt_breadcrumb_li_overflow')){
			// 删除 插入的按钮
			$('.wt_breadcrumb_li_overflow').remove();
		}
	}
	$('.wt_breadcrumb_ellipsis').attr("style", "display: none;");
	$('.wt_breadcrumb_collapse').show();
}

// 收缩 面包屑Div
function collapseBreadcrumbDiv(){
	$('.wt_breadcrumb_collapse').hide();
	calcBreadcrumbDisplayStyle();
}

// 置顶按钮
function scrollTopicTop(){
	$(window).scrollTop(0);
}

function gotoFirstPage() {
	window.parent.postMessage('gotoFirstPage', '*');
}

function manualFeedback(){
	var feedback_href = $(".body_feedback").attr('data-href');
	// 评价链接 转码
	var manualHref = location.href;
	manualHref = manualHref.substring(0, manualHref.lastIndexOf('/') + 1); // 首页URL
	var url_json = '{"url": "' + manualHref + '"}';
	var base64_url = Base64.encode(url_json); // 转Base64
	var public_survey_homepageBase64 = "";
	if(HTML_LANG == "'en-US'"){
		public_survey_homepageBase64 = feedback_href + '&isHeader=1&headerStyle=light&openParams=' + base64_url;
	} else {
		public_survey_homepageBase64 = feedback_href + '&isHeader=1&headerStyle=light&openParams=' + base64_url;
	}
	window.open(public_survey_homepageBase64, "_blank");
}

function prevTopic() {
	window.parent.postMessage('prevTopic', '*');
}
function nextTopic(){
	window.parent.postMessage('nextTopic', '*');
}

function setMiddleViewWideMode(mode){
	console.log('topic === setContentBoxWideMode');
	// .middle_view 设置边距
	if(mode == "wide") {
		$('.middle_view').attr("style", "padding-left: 36px; padding-right: 60px");
		// $('.wt_topic_wpp_content').attr('style', 'right: 180px');
	} else {
		$('.middle_view').removeAttr("style");
		// $('.wt_topic_wpp_content').removeAttr('style');
	}
	
}


function highlightSearchTerm() {
    if (HIGH_LIGHTED) {
        return;
    }
    //debug("highlightSearchTerm()");
    try {
        var $body = $('.wt_topic_content');
        var $relatedLinks = $('.wt_related_links');
		var $childLinks = $('.wt_child_links');

        // Test if highlighter library is available
        if (typeof $body.removeHighlight != 'undefined') {
            $body.removeHighlight();
            $relatedLinks.removeHighlight();

            var hlParameter = getParameter('hl');
            if (hlParameter != undefined) {
                var jsonString = decodeURIComponent(String(hlParameter));
                debug("jsonString: ", jsonString);
                if (jsonString !== undefined && jsonString != "") {
                    var words = jsonString.split(',');
                    for (var i = 0; i < words.length; i++) {
                        debug('highlight(' + words[i] + ');');
                        $body.highlight(words[i]);
                        $relatedLinks.highlight(words[i]);
                        $childLinks.highlight(words[i]);
                    }
                }
            }
        } else {
            // JQuery highlights library is not loaded
        }
    }
    catch (e) {
        debug (e);
    }
    HIGH_LIGHTED = true;
}

// 定位到topic 的锚点
function locationTopicAnchor(obj){
	console.log('topic.js:  定位到topic 的锚点');
	scrollToAnchor(obj);
}

// table 全屏
function tblZoom(zoomDiv){
	var tbl_obj = $(zoomDiv).prev();  
	var data = {
		key: 'tblZoom',
		html: $(tbl_obj).prop("outerHTML")
	};
	window.parent.postMessage(data, '*');
}
// image 全屏
function imgZoom(zoomImg){
	console.log('Image Zoom');
	
	if($(zoomImg).hasClass('fig')){
		// 热点图
		var data = {
			key: 'imgZoom',
			html: $(zoomImg).prop("innerHTML"),
			naturalWidth: $(zoomImg).find('img').prop('naturalWidth'),
			naturalHeight: $(zoomImg).find('img').prop('naturalHeight'),
			imgWidth: $(zoomImg).find('img').width(),
			imgHeight: $(zoomImg).find('img').height()
		};
		window.parent.postMessage(data, '*');
	} else {
		var data = {
			key: 'imgZoom',
			html: $(zoomImg).prop("outerHTML"),
			naturalWidth: $(zoomImg).prop('naturalWidth'),
			naturalHeight: $(zoomImg).prop('naturalHeight'),
			imgWidth: $(zoomImg).width(),
			imgHeight: $(zoomImg).height()
		};
		window.parent.postMessage(data, '*');
	}
}

// -----------------------------
// 点击轮播图文字
//   --
//   --
function carouselTextClick(figCarouselIndex, imgIndex){
	console.log('Click Text: ' + figCarouselIndex);
	$('#figCarouselContent_' + figCarouselIndex).find('.wt_fig_carousel_text_block').removeClass('active');
	$('#figCarousel_' + figCarouselIndex).carousel(imgIndex);
	// active 
	$('#figCarouselContent_' + figCarouselIndex).find('.wt_fig_carousel_text_block').eq(imgIndex).addClass('active');
	
}



// 判断手指滑动方向
function getSlideDirection(startX, startY, endX, endY) {  
    var dy = startY - endY;  
    var dx = endX - startX;  
/*     if(dy > 0){//向上滑动
        return 1;
    }else{//向下滑动
        return 2;
    } */
    if(dx > 0){//向右滑动
    	return 3;
    }else{//向左滑动
    	return 4;
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