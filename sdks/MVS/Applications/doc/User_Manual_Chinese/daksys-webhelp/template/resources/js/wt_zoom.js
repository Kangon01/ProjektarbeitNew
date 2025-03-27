
console.log("●● zoom.js");

// TOPIC页面宽度 768 为PC模式
var TOPIC_MAX_WIDTH = 768;
// 放大倍率
var currentScale = 1;

	
// -----------------------------
// 表格 全屏
// zoom 全屏显示，遮罩层样式 
// 
function openTblZoomWin(tblHtml){
	var divWidth = $(window).width();
	var divMaxHeight = $(window).height();
	// zoom 窗口
	var div_zoom = $('#div_zoom');
	// body
	var bodyHtml = '<div id="div_zoom_body" class="wt_zoom_body zoom_body_table"></div>';
	div_zoom.append(bodyHtml);
	// body 中 放入 tblHtml
	$('#div_zoom_body').append(tblHtml);  
	// close button
	var closeHtml = '<div id="div_zoom_close" class="wt_zoom_close">'
					+ '<div id="div_zoom_close_icon" class="wt_zoom_close_icon" onclick="btnCloseZoomWin();"></div>'
					+ '</div>';
	$('#div_zoom').after(closeHtml);
	// .wt_zoom_close 计算位置
	var closeTop = 70, closeRight = 70;
	$('.wt_zoom_close').attr('style', 'top: 70px; right: 70px;');
	
	//添加并显示遮罩层   
	$("<div id='mask'></div>").addClass("mask")     
							  .appendTo("body")   
							  .fadeIn(200); 
	// div_zoom 模仿遮罩层 效果  透明度 rgba(0,0,0, 0.3)
	var tableZoomStyle = 'top: 0px; left: 0px;'
					+ 'width: 100%; height: 100%;'
					+ 'background-color:rgba(0,0,0, 0.3);'
					+ 'display: flex; align-items: center; justify-content: center;';
	$('#div_zoom').attr('style', tableZoomStyle); 
	
}
// -----------------------------
//  图片 全屏
// 
// 
function openImgZoomWin(figImgHtml, naturalWidth, naturalHeight, imgWidth, imgHeight){
	// zoom 窗口
	var div_zoom = $('#div_zoom');
	div_zoom.attr('style', 'width: auto; height: auto;');
	// body
	var bodyHtml = '<div id="div_zoom_body" class="wt_zoom_body zoom_body_img"></div>';
	div_zoom.append(bodyHtml);
	// body 中 放入 figImgHtml
	$('#div_zoom_body').append(figImgHtml);
	// image
	var figImgObject = $(div_zoom_body).find('.image').eq(0);
	// movable_image 滚动放大缩小使用
	$(figImgObject).addClass('movable_image');
	$(figImgObject).attr('draggable', 'false');
	// 隐藏 img_spot
	$('.img_spot').each(function(){
		$(this).hide();
	});
	// close button
	var closeHtml = '<div id="div_zoom_close" class="wt_zoom_close">'
					+ '<div id="div_zoom_close_icon" class="wt_zoom_close_icon" onclick="btnCloseZoomWin();"></div>'
					+ '</div>';
	$(div_zoom).after(closeHtml);
	
	// div_zoom 模仿遮罩层 效果  透明度 rgba(0,0,0, 0.3)
	var divZoomStyle = 'top: 0px; left: 0px;'
					+ 'width: 100%; height: 100%;'
					+ 'background-color:rgba(0,0,0, 0.3);'
					+ 'display: block;';
	$(div_zoom).attr('style', divZoomStyle);
	
	console.log('open Zoom Image');
	
	// 计算坐标 div_zoom_body 中心显示
	var imgLeft = 0; imgTop = 0;
	// div_zoom_body 宽高
	var baseX = $('#div_zoom_body').width() / 2;
	var baseY = $('#div_zoom_body').height() / 2;
	// 左上坐标 = 0 0 display: none 隐藏
	var figStyleTimeout = 'left:' + 0 + 'px;'
						+ 'top:' + 0 + 'px;'
						+ 'display: none;';
	$(figImgObject).attr('style', figStyleTimeout);					
						
	
	// 离线状态需要先加载图片，才有 $(figImgObject).width() 数值
	setTimeout(function(){
		// 图片显示之后， $(figImgObject)才有宽高属性， 在此计算坐标
		// 左上坐标 = 中心 - 图宽高/2
		imgLeft = baseX - $(figImgObject).width() / 2;
		imgTop = baseY - $(figImgObject).height() / 2;
		figStyleTimeout = 'left:' + imgLeft + 'px;'
						+ 'top:' + imgTop + 'px;';
		
		// 计算放大倍率 -- 屏幕最大宽高
		currentScale = calcMaxScale($(figImgObject), naturalWidth, naturalHeight, imgWidth, imgHeight);
		if(currentScale != 0) {
			figStyleTimeout += 'transform:' + 'scale(' + currentScale + ');';
		} else {
			figStyleTimeout += 'transform:' + 'scale(1);';
		}
		$(figImgObject).attr('style', figStyleTimeout);
		
		// 图放大完成后才能计算热点位置，计算坐标倍率
		setTimeout(function(){
			// 重新计算 area coords
			imgMapResize();
			// 热点图 设定闪烁点
			zoomImgMapAddSpot(currentScale);
			
		}, 100); //100毫秒后执行
		//添加并显示遮罩层   
		$("<div id='mask'></div>").addClass("mask")     
								  .appendTo("body")   
								  .fadeIn(100); 
	}, 100); //1000毫秒后执行
	
	// 添加拖拽事件
	imgDragEvent();
	// 热点图 area 绑定事件 -- 只点击 闪烁点 有响应， area 不需要
	// zoomImgMapAreaOnClick();
	
}

function imgMapResize(){
	//console.log('热点位置计算');
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
// 添加拖拽事件
function imgDragEvent(){
	// movable_image 滚动放大缩小使用
	var imgObject = $(div_zoom_body).find('.image').eq(0);
	var dragging = false;
	var offsetX = 0, offsetY = 0;
	var imgX = 0; imgY = 0;
	var imgBaseX = 0; imgBaseY = 0;
	 
	$(imgObject).on('mousedown', function(e) {
		dragging = true;
		offsetX = e.clientX;
		offsetY = e.clientY;
		// 图片中心
		imgBaseX = $(imgObject).position().left + $(imgObject)[0].getBoundingClientRect().width /2;
		imgBaseY = $(imgObject).position().top + $(imgObject)[0].getBoundingClientRect().height /2;
		// 图片左上 与放大倍率无关
		imgX = imgBaseX - $(imgObject).width() /2;
		imgY = imgBaseY - $(imgObject).height() /2;
		//console.log('================== down ');
		//console.log('down 图片左上:: left: ' + imgX + '  top: ' + imgY);
		// .movable_image 对象的鼠标指针
		$('.movable_image').css({"cursor": "grabbing" });
		
	});
	 
	$(imgObject).on('mouseup', function() {
		//console.log('=============== up ');
		dragging = false;
		// .movable_image 对象的鼠标指针
		$('.movable_image').css({"cursor": "grab" });
		var currentScale = 1;
		var imgStyle = $(imgObject).attr('style');
		if(imgStyle != undefined && imgStyle != ""){
			var imgStyleArray = imgStyle.split(';');
			for(var i = 0; i<imgStyleArray.length; i++){
				if(imgStyleArray[i].indexOf('transform') > -1){
					var scale = imgStyleArray[i].split(':')[1];
					scale = scale.replace('scale', '');
					scale = scale.replace('(', '');
					currentScale = scale.replace(')', '').trim();
				}
			}
			
		}
		// 热点图 设定闪烁点
		zoomImgMapAddSpot(currentScale);
	});
	 
	$('#div_zoom_body').on('mousemove', function(e) {
		if (dragging) {
			//console.log('=============== move ' );
			// 隐藏tooltip 移动端 不响应此事件
			$('#img_usemap_tip').fadeOut(500);
			// 移动距离 + 原来左上坐标
			$(imgObject)[0].style.left = (e.clientX - offsetX + imgX) + 'px';
			$(imgObject)[0].style.top = (e.clientY - offsetY + imgY) + 'px';
			// 移动状态不显示 热点
			zoomImgMapSpotDelete();
		}
	});
}

function zoomImgMapSpotDelete(){
	// 先删除 spot
	$('.img_spot').each(function(){
		$(this).remove();
	});
}
// 热点图 设定闪烁点
function zoomImgMapAddSpot(currentScale){
	//console.log('闪烁点计算：'  + currentScale);
	// 先删除 spot
	$('.img_spot').each(function(){
		$(this).remove();
	});
	$('img.image_usemap').each(function(){
		var imagemapObj = $(this).parent(); // zoom_body
		var mapObj = $(this).next();
		var areaDomList = $(mapObj).find('area');
		for(var i=0; i<areaDomList.length; i++){
			var href = $(areaDomList[i]).attr('data-href');
			var shape = $(areaDomList[i]).attr('shape');
			if(shape  == 'rect'){
				// 矩形： 计算之后的 coords
				var coordsArray = $(areaDomList[i]).attr('coords').split(',');
				// 中心点 
				var spotX = (Number(coordsArray[0]) + Number(coordsArray[2])) / 2 * currentScale;
				var spotY = (Number(coordsArray[1]) + Number(coordsArray[3])) / 2 * currentScale;
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
				$(mapObj).next().css({
					'top': $(this).position().top + spotY - 10,
					'left': $(this).position().left + spotX - 10,
					'transform': `scale(${currentScale})` 
				});
				//console.table($(this).position());
				//console.log('spotX:' + spotX + '   spotY:' + spotY);
			} else if(shape  == 'circle'){
				// 圆形： 计算之后的 coords
				var coordsArray = $(areaDomList[i]).attr('coords').split(',');
				// 中心点 == 圆心
				var spotX = Number(coordsArray[0]) * currentScale;
				var spotY = Number(coordsArray[1]) * currentScale;
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
				$(mapObj).next().css({
					'top': $(this).position().top + spotY - 10,
					'left': $(this).position().left + spotX	- 10,
					'transform': `scale(${currentScale})` 
				});
			}
		}
	});
	// spot 绑定事件
	zoomImgMapSpotOnClick();
}

// 热点图 area 绑定事件 -- 只点击 闪烁点 有响应， area 不需要
function zoomImgMapAreaOnClick(){
	$("area").on('click', function(event) {
		var guid_html = event.target.pathname;
		if ($(window).width() > TOPIC_MAX_WIDTH) {
			if (guid_html == "void(0);") {
				// 显示 Tip
				$('#img_usemap_tip').fadeOut(500);
				$(".img_usemap_tip_title").text(event.currentTarget.title);
				$(".img_usemap_tip_text").text(event.currentTarget.alt);
				$('#img_usemap_tip')
				  .css({
					top: event.clientY + 12,
					left: event.clientX + 12
				  })
				.fadeIn(500);
				
			} else {
				// 页面跳转
				btnCloseZoomWin();
				event.preventDefault(); // 阻止 href
				console.log("from zoom: open html" );
				var index_href = guid_html.lastIndexOf('/');
				guid_html = guid_html.substr(index_href + 1);
				$("#frame_element").attr("src", guid_html);
				//高亮左侧菜单 menu_toc_ul menu_ul
				setMenuActiveByGuid(guid_html);	
				
			}
			
		} else {
			// Mobile 弹出框  -- 发送到 index 页面显示
			if (guid_html == "void(0);") {
				var data = {
					key: 'imgusemapTip',
					title: event.currentTarget.title,
					text: event.currentTarget.alt
				};
				window.parent.postMessage(data, '*');
			} else {
				// 页面跳转
				btnCloseZoomWin();
				event.preventDefault(); // 阻止 href
				console.log("from zoom: open html" );
				var index_href = guid_html.lastIndexOf('/');
				guid_html = guid_html.substr(index_href + 1);
				$("#frame_element").attr("src", guid_html);
				//高亮左侧菜单 menu_toc_ul menu_ul
				setMenuActiveByGuid(guid_html);	
			}
			
		}
		
	});
	$('area').mouseout(function(event) {
		// 隐藏tooltip 移动端 不响应此事件
		$('#img_usemap_tip').fadeOut(500);
	});
	
}
// 热点图 spot 绑定事件
function zoomImgMapSpotOnClick(){
	// spot 绑定
	$('div.img_spot').on('click', function(event) {
		var index = Number($(event.currentTarget).attr('id').replace('img_spot',''));
		var mapObj = $(this).siblings('map');
		var areaArray = $(mapObj).find('area');
		if ($(window).width() > TOPIC_MAX_WIDTH) {
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
			.fadeIn(500);
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
	$('img_spot').mouseout(function(event) {
		// 隐藏tooltip 移动端 不响应此事件
		$('#img_usemap_tip').fadeOut(500);
	});
	
}

/* 鼠标滚轮，放大图片 打开默认放大倍率 */
const MIN_SCALE = 0.1;
const MAX_SCALE = 10;
$(document).bind('wheel', function(event) {
    // 鼠标滚轮事件处理逻辑
	// div_zoom 中是 id=div_zoom_body  class=wt_zoom_body zoom_body_img 
	if($('#div_zoom .zoom_body_img').length > 0){
		// 隐藏tooltip 移动端 不响应此事件
		$('#img_usemap_tip').fadeOut(500);
		
		var delta = event.originalEvent.deltaY < 0? 0.2 : -0.2;
		currentScale = currentScale + delta;
		currentScale = Math.round(currentScale * 100) / 100;
		if(currentScale < MIN_SCALE) {
			currentScale = MIN_SCALE;
			return;
		} else if(currentScale > MAX_SCALE){
			/* currentScale = MAX_SCALE;
			return; */
		}
		//console.log('Image Scale:' + currentScale);
		$('#div_zoom .movable_image').css({
		  'transform': `scale(${currentScale})` 
		});
		// 热点图 设定闪烁点
		zoomImgMapAddSpot(currentScale);
	}
});

function btnCloseZoomWin(){
	var div_zoom = $('#div_zoom');
	div_zoom.empty();
	closeMaskDiv('div_zoom');
	currentScale = 1;
	// close button
	$('#div_zoom_close').remove();
}

// 计算屏幕最大放大倍率
function calcMaxScale(imgObj, naturalWidth, naturalHeight, imgWidth, imgHeight){
	var scale = 0;
	// 判断设定的是 width 属性，还是  max-height 属性
	if($(imgObj).attr('width')!= undefined && $(imgObj).attr('width')!=""){
		// width
		if(imgWidth/$(window).width() > imgHeight/$(window).height()){
			// 计算宽度 
			scale = $(window).width()/imgWidth;
		} else {
			// 计算高度
			scale = $(window).height()/imgHeight;
		}
		console.log('zoom image Scale:' + scale);
		return scale;
		
	} else {
		// max-height 属性需要删除
		$(imgObj).attr('style', '');
		if(naturalWidth/$(window).width() > naturalHeight/$(window).height()){
			// 计算宽度
			scale = $(window).width()/naturalWidth;
			console.log('用宽度计算 Scale:' + scale);
		} else {
			// 计算高度
			scale = $(window).height()/naturalHeight;
			console.log('用高度计算 Scale:' + scale);
		}
		
		if(scale < 1){
			console.log('zoom image Scale:' + scale + " >>> 1");
			// 图大于屏幕高度，自动等于屏幕高度  scale = 1
			return 1;
		} else {
			console.log('zoom image Scale:' + scale);
			// 图小，需要放大
			return scale;
		}
	}
}