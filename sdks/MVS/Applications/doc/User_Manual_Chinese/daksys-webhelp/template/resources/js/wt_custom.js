

console.log("●● custom.js ");
// -----------------------------
// 
// 定制菜单
// 
// document.ready()
// 
// 
// 
// "显示" 开关
var SWITCH_HIDE = "Hide";
var SWITCH_DISPLAY = "Display";

// 是否已经读取menu属性
var IS_MENU_READED = false;
// 当前menu是否定制
var IS_MENU_CUSTOM = false;
// "必须显示"属性名称
var FILTER_DISPLAY = "HIKFILTERDISPLAY";
// 必须显示项目 -- zTree 使用
var g_mustGuidArray = new Array();
// 可显示的Guid
var g_guidArray = new Array();
// 从页面隐藏项目 读取KEY  (属性类型KEY，属性显示名称[中/英])
var KEY_TYPE_NAME_MAP = new Map();

// 从Json文件读取--(型号，属性组合)
var gData_modelAttrMap = new Map();
// 从menu读取: (属性类型, 全部属性Array)  定制手册页面显示用
var gData_attrTypeAttrsMap = new Map();
// menu的GUIDE—AttrType, 属性组合
var gMenu_menuAttrType_attrsMap = new Map();


// add delete Array
var gTemp_addGuidArray = new Array();
var gTemp_addTextArray = new Array();
var gTemp_deleteGuidArray = new Array();
var gTemp_deleteTextArray = new Array();

//var gTemp_zTreeArray = new Array();
// 属性组的预选项目匹配的 GUID
//var gTemp_attrGroupGuidArray = new Array();
//var gTemp_attrGroupTextArray = new Array();

// 更多章节的预选章节 GUID -------- 因为是zTree插件，功能上不能实现。
//var gTemp_topicGuidArray = new Array(); 

var MAX_JSON_COUNT = 8;
var JOIN_STRING = "_##_";
var HTML_LANG = $('#lang')[0].outerText;

// 1)页面[HIKMODELSWITCH]开关判断, 2)读取json文件判断
var DISPLAY_MODEL_SELECT = true; // 显示型号 = true

// -----------------------------
// document.ready()
// --- 读取 attribute_map.json
// --- 显示 属性群
// --- 判断是否显示[型号列表]
// --- 
//
$(document).ready(function () {
	console.log("●●●● custom > ready()");
	// DEBUG start
	// localStorage.removeItem("HIK_MANUALID_TYPE_ATTR_DS-1600K=GUID-1EB3D536-6878-48CD-A823-4622932E60F5");
	// localStorage.removeItem("");
	// localStorage.removeItem("HIK_MANUALID_TYPE_ATTR_DS-1600K=GUID-1EB3D536-6878-48CD-A823-4622932E60F5");
	// DEBUG
	
	$('#div_custom_win').show();
	// 判断是否显示[型号列表]   型号/属性种类 可能同时显示
	displaySelectModel();
	// 读取页面隐藏项目--属性Type：显示名称
	getHiddenInfoTypeName();
	// 读取文件attribute_map.json 
	readAttributeMapJson();
	// 读取 menu 属性. 存入 localStorage
	readMenuAttrInfo();
	
	if($(window).width() > 768) {
		// PC
		// 型号 Change
		select2Onchange();
		// 定制手册的hover tooltip 具体操作参考
		eventTipQuestionHover();
	} else {
		// Mobile 
		// 型号 Change
		select2OnchangeMobile();
		// 隐藏定制按钮
		displayCustomAreaMobile();
		// Mobil 隐藏 更多章节 的必须显示项目
		hideCustomMobilTopicDisplay();
	}
	
	$('#div_custom_win').hide();
	
});
// 判断是否显示[型号列表]
function displaySelectModel(){
	//型号列表   通过KC设置的开关 判断是否隐藏
	var model_onoff = $( "input[name$='HIKMODELSWITCH']" ).val();
	if(model_onoff == SWITCH_HIDE){
		console.log("HIKMODELSWITCH>>>隐藏型号列表");
		$("#div_model").remove();
		DISPLAY_MODEL_SELECT = false;
	}
}
// 定制手册的hover tooltip 具体操作参考
function eventTipQuestionHover() {
	$('#tip_question').hover(function(e) {
		// 显示tooltip
		console.log("显示tooltip");
		var targetTop = e.target.getBoundingClientRect().top - 3;
		var targetLeft = e.target.getBoundingClientRect().right + 8;
		// var msgTop = e.pageY + 4;
		// var msgLeft = e.pageX + 12;
		$('#tip_message')
		  .css({
			top: targetTop,
			left: targetLeft
		  })
		.fadeIn('fast');
	}, function(){
		// 隐藏tooltip
		// $('#tip_message').fadeOut('slow');
	});
	$('#tip_message').hover(function(e) {
		// 持续显示 message
	}, function(){
		// 隐藏tooltip
		$('#tip_message').fadeOut(1000);
	});
}
// -----------------------------
// 
// PC 定制手册窗口：打开/关闭 (遮罩层)
// 
function openCustomWin(){
	// 删除 'z-index: -100;' 显示窗口
	$("#div_custom_win").removeAttr('style');
	
	var posLeft = ($(window).width() - $("#div_custom_win").width()) / 2;
	var posTop = ($(window).height() - $("#div_custom_win").height()) / 2;
	$("#div_custom_win").css({"top": posTop , "left": posLeft}).fadeIn();   
	
	// PC 模式 显示窗口
	$("#div_custom_topic").hide();
	$("#div_custom_model_attr").show();
	$('#div_custom_attributes').css({"overflow-y": "auto"});
	// 添加并显示遮罩层   
	$("<div id='mask'></div>").addClass("mask")     
							  .appendTo("body")   
							  .fadeIn(200);   
	
	// 动态添加数据
	if($(window).width() > 768) {
		// PC 动态生成 型号&属性组
		displaySelectArea();
		// zTree 初始化
		initzTree();
		//PC 设置选中的属性项目, 选中的型号
		setCustomModeleAttrs();
		// 从搜索页面跳转
		if(FROM_SEARCH_PAGE){
		}
	} else {
	}

	// 属性对应GUID
	//matchAttrTypeGuid();
	// 更新 zTree 内容
	//updatezTree(); 
		
	// 需要二次计算才显示正确位置
	posLeft = ($(window).width() - $("#div_custom_win").width()) / 2;
	posTop = ($(window).height() - $("#div_custom_win").height()) / 2;
	$("#div_custom_win").css({"top": posTop , "left": posLeft}).fadeIn();   
	
	 
	/* 定制手册: 增加每个 input type=checkbox 的点击事件 */
	$('input[type="checkbox"]').unbind('click').bind('click', function(event){
		// 取消全选
		var attrType = event.target.id.split('_')[0];
		if(attrType != 'check'){
			$('#check_all_' + attrType).prop('checked', false);
			event.stopPropagation();
		}
	});
	/* 定制手册: 属性 的change事件 */
	$('.wt_custom_label').on('change', function(){
		// add delete
		var isChecked = $(this).find('input').prop('checked');
		if(isChecked){
			// add
			// 每次一个动作属性，match属性关联的GUID
			matchAddGuid($(this));
		} else {
			// delete
			// 每次一个动作属性，match属性关联的GUID
			matchDeleteGuid($(this));
		}
		// 遍历全部 attrType 的全部属性值, 搜索GUID属性满足条件
		//matchAttrTypeGuid();
		// 更新 zTree 内容
		updatezTree();
		// 清空
		gTemp_addGuidArray = new Array();
		gTemp_addTextArray = new Array();
		gTemp_deleteGuidArray = new Array();
		gTemp_deleteTextArray = new Array();
	});
	/* 更多章节: zTree 的click事件 （zTree默认只加载第一层节点，无法绑定二层以下节点）*/
	
}
function closeMaskDiv(div_id) {   
	$("#mask").remove();   
	$("#" + div_id).fadeOut();   
}  

// -----------------------------
// 
// 定制手册：取消按钮
// 
function btnCloseCustomWin(){
	// 隐藏tooltip
	$('#tip_message').fadeOut(100);
	closeMaskDiv('div_custom_win');

	// 删除页面项目
	$('#div_custom_model').show();
	// 型号清空
	$("#selectModel").val("").select2();
	$("#selectModel").select2({width:"100%"});
	// 清空属性
	$('#div_custom_attributes').empty();
}

// 更多章节：返回 定制手册页面
function showCustomModelAttrDiv(){
	// 保存选中GUID

	$("#div_custom_topic").hide();   
	$("#div_custom_model_attr").show();
	var customWin = $("#div_custom_win");  
	var posTop = ($(window).height() - customWin.height()) / 2;
	var posLeft = ($(window).width() - customWin.width()) / 2;
	customWin.css({"top": posTop , "left": posLeft}).fadeIn();
}
// -----------------------------
// 
// 定制手册窗口：展开/ 折叠
// 
function expandTypeItem(DIV_TYPE){
	var expandText = getLocalization("webhelp.custom.expand");
	var collapseText = getLocalization("webhelp.custom.collapse");
	// 显示
	$(DIV_TYPE + " .body_item_hidden").each(function(){
		$(this).show();
	});	
	$(DIV_TYPE).find(".wt_custom_type_body_item_expend_button").parent().hide();
	$(DIV_TYPE).find(".wt_custom_type_body_item_collapse_button").parent().show();
	
}
function collapseTypeItem(DIV_TYPE){
	var expandText = getLocalization("webhelp.custom.expand");
	var collapseText = getLocalization("webhelp.custom.collapse");
	// 隐藏
	$(DIV_TYPE + " .body_item_hidden").each(function(){
		$(this).hide();
	});
	$(DIV_TYPE).find(".wt_custom_type_body_item_expend_button").parent().show();
	$(DIV_TYPE).find(".wt_custom_type_body_item_collapse_button").parent().hide();
}
// -----------------------------
// 
// 定制手册窗口：全选 / 清除选中
//            保存临时属性条件
// 
function attrTypeCheckAll(attrType, DIV_TYPE){
	console.log(' Custom Attr  全选 / 清除选中');
	var checkAllText = getLocalization("webhelp.check.all");
	var cleanText = getLocalization("webhelp.check.clean");
	var spanText = $("#text_checkall_" + attrType).text();
	if(spanText == checkAllText){
		// 全选
		$(DIV_TYPE + " input").each(function(){
			$(this).prop("checked",true);
		});
		$("#text_checkall_" + attrType).text(cleanText);
		expandTypeItem(DIV_TYPE);
		// add
		$(DIV_TYPE + " .wt_custom_label").each(function(){
			// 每次一个动作属性，match属性关联的GUID
			matchAddGuid($(this));
		});
		
	} else {
		$(DIV_TYPE + " input").each(function(){
			$(this).prop("checked",false);
		});	
		$("#text_checkall_" + attrType).text(checkAllText);
		// delete
		$(DIV_TYPE + " .wt_custom_label").each(function(){
			// 每次一个动作属性，match属性关联的GUID
			matchDeleteGuid($(this));
		});
	}
	// 更新 zTree 内容
	updatezTree();
	// 清空
	gTemp_addGuidArray = new Array();
	gTemp_addTextArray = new Array();
	gTemp_deleteGuidArray = new Array();
	gTemp_deleteTextArray = new Array();
}


// document.ready()
// 读取页面隐藏项目--属性Type：显示名称
function getHiddenInfoTypeName(){
	// <input type="hidden" name="HIKFUNCTION" value="功能" />
	// 从页面隐藏项目div_custom_type_name 取得属性类别的 key--name   
	if(HTML_LANG == 'en-US'){
		$('#div_custom_type_name_en input').each(function(){
			var attrType = $(this).attr("name");
			var attrName = $(this).attr("value");
			//  ("ATTRTYPE0": "固定显示" 没有input)  固定拼接SWITCH
			var attrType_switch = $( "input[name$='"+attrType+"SWITCH']" ).val();
			if(attrType_switch != undefined && attrType_switch == 'Display'){
				console.log("ATTR TYPE-NAME MAP>>>" + attrType + ":" + attrName);
				KEY_TYPE_NAME_MAP.set(attrType, attrName);
				gData_attrTypeAttrsMap.set(attrType, new Array());
			}
		});
	} else {
		$('#div_custom_type_name input').each(function(){
			var attrType = $(this).attr("name");
			var attrName = $(this).attr("value");
			//  ("ATTRTYPE0": "固定显示" 没有input)  固定拼接SWITCH
			var attrType_switch = $( "input[name$='"+attrType+"SWITCH']" ).val();
			if(attrType_switch != undefined && attrType_switch == 'Display'){
				console.log("ATTR TYPE-NAME MAP>>>" + attrType + ":" + attrName);
				KEY_TYPE_NAME_MAP.set(attrType, attrName);
				gData_attrTypeAttrsMap.set(attrType, new Array());
			}
		});
	}
}
// document.ready()
// 读取 attribute_map.json & 显示
function readAttributeMapJson(){
	// 判断是否已经读取
	if(gData_modelAttrMap.size > 0 ){
		return;
	}
	// 多个 JSON 文件
	var jsonUrlArray = new Array();
	jsonUrlArray.push("/attribute_map.json");
	jsonUrlArray.push("/attributes_map.json");
	for(var i = 1; i <= MAX_JSON_COUNT; i++){
		jsonUrlArray.push("/attributes_map" + i + ".json");
	}
	var href = window.location.href;
	var urlPath = href.substring(0, href.lastIndexOf('/'));
	
	//设定 getJSON同步
	$.ajaxSettings.async = false; 
	// 读取多个 AttributeMap JSON 文件, 只有型号信息 
	for(var i = 0; i < jsonUrlArray.length; i++){
		readAttributeMapJsonFile(urlPath, jsonUrlArray[i]);
	}
	$.ajaxSettings.async = true;
}
// document.ready()
// 读取 menu 属性. 存入 gData_attrTypeAttrsMap
function readMenuAttrInfo(){
	// 判断是否已经读取
	if(IS_MENU_READED){
		return;
	}
	//从 menu 读取属性值
	//console.log("Read Attributes From Menu" );
	//从 menu 读取属性存入 gData_attrTypeAttrsMap
	var type_attr_count_map = new Map();
	// '.menu_toc_ul li'  g_guid_dataAttr_map  
	$('.menu_toc_ul li').each(function(){
		var a = $(this).find("a").eq(0);
		var aText = a.text();
		var guid = getAguid(a);
		// 保存 必须显示的目录项目
		var display_attr = a.attr("data-" + FILTER_DISPLAY) == undefined ? "" : a.attr("data-"+ FILTER_DISPLAY);
		if(display_attr != "" && g_mustGuidArray.indexOf(guid) == -1){
			g_mustGuidArray.push(guid);
		}
		// 保存目录的属性 : (guid+attrType, attrs)
		// 存储每个属性类型的全部属性值 gData_attrTypeAttrsMap
		saveMenuAttrs2Map(a, guid, type_attr_count_map);
		
	});
	IS_MENU_READED = true;
	// 循环Type， 按照次数排序  次数多的显示在前面  
	KEY_TYPE_NAME_MAP.forEach((attrName, attrType)=>{
		var attr_list = gData_attrTypeAttrsMap.get(attrType);
		var attr_sorted_list = new Array();//当前 attrType按照次数排序的属性
		//
		for(var i=0; i<attr_list.length; i++){
			var max_attr = getMaxCountAttr(attrType, type_attr_count_map);
			if(max_attr.trim() != ""){
				attr_sorted_list.push(max_attr);
			}
		}
		//  保存排序后的属性
		gData_attrTypeAttrsMap.set(attrType, attr_sorted_list);
	});
}
// document.ready()
// PC 动态生成 型号&属性组
function displaySelectArea(){
	//没有型号Map
	if(gData_modelAttrMap.size == 0 ){
		console.log("HIKMODELSWITCH>>>没有型号");
		$("#div_custom_model").hide();
		DISPLAY_MODEL_SELECT = false;
	}
	// 判断: 没有型号Map and 没有属性名称Map（无法匹配名称）
	if(gData_modelAttrMap.size == 0 && KEY_TYPE_NAME_MAP.size == 0){
		// 隐藏 定制手册按钮 PC
		$(".wt_menu_page_menu_header_button_custom").hide();
		$(".mobile_menu_header_custom").hide();
	} else {
		// 动态生成 型号&属性组 PC
		displayAttrGroup();
	}
}
function displayCustomAreaMobile(){
	//没有型号Map
	if(gData_modelAttrMap.size == 0 ){
		console.log("HIKMODELSWITCH>>>没有型号");
		$("#div_model").remove();
		DISPLAY_MODEL_SELECT = false;
	}
	// 判断: 没有型号Map and 没有属性名称Map（无法匹配名称）
	if(gData_modelAttrMap.size == 0 && KEY_TYPE_NAME_MAP.size == 0){
		// 隐藏 定制手册按钮 Mobile
		$(".mobile_menu_header_custom").hide();
		// 修改 搜索宽度
		$(".mobile_menu_header_search").attr('style', 'width:calc(100% - 64px);');
	} else {
		if(HTML_LANG == 'en-US'){
			// 英文
			$(".mobile_menu_header_search").attr('style', 'width:calc(100% - 210px);');
		} else {
			// 中文
			$(".mobile_menu_header_search").attr('style', 'width:calc(100% - 180px);');
		}
	}
}
// document.ready()
// 读取多个 AttributeMap JSON 文件 只读取型号信息
function readAttributeMapJsonFile(urlPath, json_url){
	try{
		$.ajaxSetup({
			error: function (x, e) {
				//console.log("---★" + json_url + " 文件不存在.");
				return false;
			}
		});

		//  getJSON{}是异步的
		$.getJSON(urlPath + json_url, function (data){
			if (data != null) {
				console.log("--- 读取文件 " + json_url);
				//-------- data[0] Type ---------------------
				// 不使用此方法读取 data[0]  从页面读取
				
				//-------- data[1] MODEL ---------------------
				if(DISPLAY_MODEL_SELECT){
					$.each(data[1], function (model, attrTypeAttrJson){
						var newJson = {};
						KEY_TYPE_NAME_MAP.forEach((attrName, shortType)=>{
							newJson[shortType] = attrTypeAttrJson["D" + shortType];
						});
						console.log("型号：" + model);
						gData_modelAttrMap.set(model, newJson);
						
					});
				}
				
				//-------- data[2] GUID ---------------------
				//readJsonGuid(data[2]); 不使用此方法读取JSON GUID
				
			} else {
				console.log("---★ " + json_url + " 为 NULL");
			}
		});

	} catch(e){
		console.log("---★read error: " + json_url);
	}
}

// 保存目录的属性
// 保存gData_attrTypeAttrsMap: attrType, attrType_AllAttr_List
function saveMenuAttrs2Map(a, guid, type_attr_count_map){
	KEY_TYPE_NAME_MAP.forEach((attrName, attrType)=>{
		// 拼接 encode(Text) ,GUID,Attr TYPE
		var MENU_ATTRTYPE = encodeURIComponent(a.text()) + "," + guid + "," + attrType;
		var type_attrs = a.attr("data-" + attrType) == undefined ? "" : a.attr("data-"+ attrType);
		if(type_attrs.trim() == ''){
			return;
		}
		
		type_attrs = type_attrs.replaceAll(/,\s+/ig, ',');
		gMenu_menuAttrType_attrsMap.set(MENU_ATTRTYPE, type_attrs);
		
		// 属性类型 的全部属性值 加上新的属性值
		var attr_list = gData_attrTypeAttrsMap.get(attrType);
				
		var attrList = type_attrs.split(",");
		for(var i=0; i< attrList.length; i++){
			if(attrList[i].trim() != ""){
				// 统计使用次数 type_attr_count_map
				var type_attr = attrType + JOIN_STRING + attrList[i].trim();
				if(type_attr_count_map.has(type_attr)){
					var count = type_attr_count_map.get(type_attr);
					count++;
					type_attr_count_map.set(type_attr, count);
				} else {
					var count = 1;
					type_attr_count_map.set(type_attr, count);
				}
				// 属性类型 的全部属性值
				if(attr_list.indexOf(attrList[i].trim()) == -1){
					attr_list.push(attrList[i].trim());
				}
			}
		}
		// 存入Map
		gData_attrTypeAttrsMap.set(attrType, attr_list);
	});
}

// 定制页面，返回attrType 的最多次数的属性，并删除自己
function getMaxCountAttr(attrType, type_attr_count_map){
	var max_attr = "";
	//找到 type_attr_count_map 最大的count
	var max_count = 0;
	var max_attr = "";
	type_attr_count_map.forEach((count, type_attr)=>{
		var current_type = type_attr.substring(0, type_attr.indexOf(JOIN_STRING));
		var current_attr = type_attr.substring(type_attr.indexOf(JOIN_STRING) + JOIN_STRING.length);
		if(attrType == current_type){
			max_attr = count > max_count? current_attr: max_attr;
			max_count = count > max_count? count: max_count;
		}
	});
	// 删除map 中最大的对象
	type_attr_count_map.delete(attrType + JOIN_STRING + max_attr);
	return max_attr;
	
}
	
// 动态生成 型号&属性组
function displayAttrGroup(){
	//console.log("--- 动态生成 型号列表 & 属性项目 ");
	if(DISPLAY_MODEL_SELECT){
		var optionHTMLS = "<option value=''>" + "</option>" + "\r\n";
		//gData_modelAttrMap 
		gData_modelAttrMap.forEach((attrCollection, model)=>{
			optionHTMLS += "<option value='" + model + "'>" + model  + "</option>" + "\r\n";
		});
		//显示 型号 selectModel  <option value="volvo">Volvo</option>
		$("#selectModel").append(optionHTMLS);
		$("#selectModel").select2({width:"100%"});
	}
	
	var TYPE_ITEM_BUTTON = "auto";
	var TYPE_ITEM_WIDTH;
	var TYPE_BUTTON_WIDTH;
	if(HTML_LANG == 'en-US'){
		TYPE_ITEM_WIDTH = "180px";
		TYPE_BUTTON_WIDTH = "95px";
	} else {
		TYPE_ITEM_WIDTH = "130px";
		TYPE_BUTTON_WIDTH = "20px";
	}
	TYPE_ITEM_WIDTH = "auto";
	TYPE_BUTTON_WIDTH = "auto";
	// 可显示属性值的最大宽度（573） wt_custom_win 宽度 - wt_custom_type_header 宽度
	var MAX_BODY_WIDTH = $('.wt_custom_win').width() - $('.wt_custom_type_header').width() - 50;
	var isOverSize = false;
	
	// 从 attrTypeMap 取得属性组信息
	var LINE_ITEM_MAX_COUNT = 6;
	var type_idx = 0;
	KEY_TYPE_NAME_MAP.forEach((attrName, attrType)=>{
		isOverSize = false;
		type_idx ++;
		// HIDE 不显示在页面上
		var attrType_switch = $( "input[name$='"+attrType+"SWITCH']" ).val();
		if(attrType_switch == SWITCH_HIDE || attrType_switch == undefined){
			return;						
		} 
		// 属性值 数组
		var attrValArray = gData_attrTypeAttrsMap.get(attrType);
		// 没有被使用的属性类别，不显示在页面上
		if(attrValArray.length == 0){
			return;			
		}
		// wt_custom_type
		var DIV_TYPE = '#div_' + attrType;
		var wt_custom_type = '<div id="div_'+attrType+'" class="wt_custom_type"></div>';
		$("#div_custom_attributes").append(wt_custom_type);
		// DIV_TYPE >>> wt_custom_type_header
		var div_type_header_html = "<div class='wt_custom_type_header'>";
		div_type_header_html += '<div class="wt_custom_type_title"><span>'+attrName+'</span></div>';
		div_type_header_html += "</div>";
		$(DIV_TYPE).append(div_type_header_html);
		// DIV_TYPE >>> wt_custom_type_body
		var div_type_body_html = "<div class='wt_custom_type_body'></div>";
		$(DIV_TYPE).append(div_type_body_html);
		
		// 全选 按钮
		// DIV_TYPE wt_custom_type_body  >>> wt_custom_type_body_item 
		var checkAllText = getLocalization("webhelp.check.all");
		var div_checkAll_button = '<div class="wt_custom_type_body_item " style="width:'+TYPE_ITEM_WIDTH+';">'
					+ '<label class="wt_custom_label_all" >'
					+ '<input type="checkbox" id="check_all_'+attrType+'" onclick="attrTypeCheckAll(\''+attrType+'\',\''+DIV_TYPE+'\');"/>'
					+ '<label for="check_all_'+attrType+'" class="checkbox" ></label>'
					+ '<span id="text_checkall_' + attrType + '">' + checkAllText + '</span>'
					+ '</label></div>';
		$(DIV_TYPE + " .wt_custom_type_body").append(div_checkAll_button);
		
		// 循环添加 判断长度  
		// wt_custom_type_body  >>> wt_custom_type_body_item 
		for(var i=0; i< attrValArray.length; i++){
			var attrNoChar = getAttrValueNoChar(attrValArray[i]);
			var checkbox_id = attrType + "_CHECKBOX_" + attrNoChar;
			var body_item ='<div class="wt_custom_type_body_item" style="width:'+TYPE_ITEM_WIDTH+';">'
							+ '<label class="wt_custom_label" data-type="' + attrType + '">'
							+ '<input type="checkbox"  id="'+ checkbox_id +'" value="'+ attrValArray[i]+'" />'
							+ '<label for="'+ checkbox_id +'" class="checkbox" ></label>'
							+ '<span data-tooltip="'+attrValArray[i]+'" >'+ attrValArray[i]+'</span>'
							+ '</label></div>';
			
			$(DIV_TYPE + " .wt_custom_type_body").append(body_item);
			// 计算长度
			var body_items = $(DIV_TYPE).find('.wt_custom_type_body_item');
			var items_length = 0;
			for(var m=0; m< body_items.length; m++){
				items_length += ($(body_items[m]).width() + 8); // wt_custom_type_body_item : padding-right=8px
			}
			// 当前总长度 超过 MAX_BODY_WIDTH， 隐藏当前项目
			if(items_length> MAX_BODY_WIDTH){
				isOverSize = true;
				// 不需要此功能 --计算剩余长度 是否可以显示 【展开>>】 固定长度 zh-CN:52  en:70
				// 前一个隐藏，用来显示 【展开>>】
				$(body_items[body_items.length-2]).hide();
				$(body_items[body_items.length-2]).addClass('body_item_hidden');
				// 当前设定隐藏  隐藏项目设定 id 用于切换显示/隐藏
				$(body_items[body_items.length-1]).hide();
				$(body_items[body_items.length-1]).addClass('body_item_hidden');
			}
			
		}
		if(isOverSize) {
			// 插入  展开按钮
			var expandText = getLocalization("webhelp.custom.expand");
			var oversize_expend_button_item = '<div class="wt_custom_type_body_item body_item_button" style="width:'+TYPE_ITEM_BUTTON+';">'
				+ '<a class="wt_custom_type_body_item_expend_button" href="javascript:void(0);" '
				+ ' onclick="expandTypeItem(\''+DIV_TYPE+'\');" ><span>' + expandText + '</span></a></div>';
			$(DIV_TYPE + " .wt_custom_type_body").append(oversize_expend_button_item);
			// 插入  折叠按钮
			var collapseText = getLocalization("webhelp.custom.collapse");
			var oversize_collapse_button_item = '<div class="wt_custom_type_body_item body_item_button" style="display:none;width:'+TYPE_ITEM_BUTTON+';">'
				+ '<a class="wt_custom_type_body_item_collapse_button" href="javascript:void(0);" '
				+ ' onclick="collapseTypeItem(\''+DIV_TYPE+'\');" ><span>' + collapseText + '</span></a></div>';
			$(DIV_TYPE + " .wt_custom_type_body").append(oversize_collapse_button_item);
		}
		
	});
}

//PC 设置选中的属性项目, 选中的型号
function setCustomModeleAttrs(){
	//从搜索页面跳转 --- 设置页面选中项目
	var selected_model = localStorage.getItem(STORAGE_HIK_MANUALID_MODEL);
	if(selected_model != null && selected_model != ""){
		//设置型号选中
		$("#selectModel").val(selected_model).select2();
		$("#selectModel").select2({width:"100%"});
	} 
	//设置属性选中
	if(HTML_LANG == 'en-US'){
		$('#div_custom_type_name_en input').each(function(){
			var attrType = $(this).attr("name");
			//var attrName = $(this).attr("value");
			var attrValString = localStorage.getItem(STORAGE_HIK_MANUALID_TYPE_ATTR + "," + attrType);
			if(attrValString == null ){
				return;
			}
			//console.log("--- 设置选中项目>>> " + attrType + ":" + attrValString);
			var attrValArray = attrValString.split(",");
			for(var idx in attrValArray){
				// 把空格替换下划线
				var attrNoChar = getAttrValueNoChar(attrValArray[idx]);
				$("#" + attrType + "_CHECKBOX_" + attrNoChar).attr("checked",true)//选中

			}
		});
		
	} else {
		$('#div_custom_type_name input').each(function(){
			var attrType = $(this).attr("name");
			//var attrName = $(this).attr("value");
			var attrValString = localStorage.getItem(STORAGE_HIK_MANUALID_TYPE_ATTR + "," + attrType);
			if(attrValString == null ){
				return;
			}
			//console.log("--- 设置选中项目>>> " + attrType + ":" + attrValString);
			var attrValArray = attrValString.split(",");
			for(var idx in attrValArray){
				// 把空格替换下划线
				var attrNoChar = getAttrValueNoChar(attrValArray[idx]);
				$("#" + attrType + "_CHECKBOX_" + attrNoChar).attr("checked",true)//选中

			}
		});
	}
}

// -----------------------------
// 
// 定制手册窗口：确定按钮
// 
// --型号
// --属性
// --更多章节
// --STORAGE保存定制条件,运行定制目录逻辑
function btnConfirmCustom(){
	// 隐藏tooltip
	$('#tip_message').fadeOut(1000);

	var hasCondition = false;
	// 判断是否选择型号
	var model_val;
	if(DISPLAY_MODEL_SELECT){
		model_val = $("#selectModel").select2("val");
		if(model_val != ""){
			hasCondition = true;
		}
	}
	// 属性
	var checkedItemList = $("#div_custom_attributes input:checked");
	if(checkedItemList.length > 0) {
		hasCondition = true;
	}
	// 更多章节
	var zTreeRight = $.fn.zTree.getZTreeObj("treeRight");
	var checkedNodes = zTreeRight.getCheckedNodes(true);
	if(checkedNodes.length > 0){
		hasCondition = true;
	}
	if(!hasCondition) {
		// 请先选择筛选条件。
		var alertText = getLocalization("webhelp.custom.check");
		hikAlert(getLocalization("Tip"), alertText, function(){   
			//要回调的方法 
		}); 
		
	} else {
		// STORAGE保存定制条件，运行定制目录逻辑
		execCustomMenu();
		// 关闭
		btnCloseCustomWin();
	}

}
// -----------------------------
// 定制手册窗口：运行定制目录逻辑
// 
// --STORAGE保存定制条件
// --根据 zTree 右树过滤 menu 
// 
// 
function execCustomMenu(){
	console.log('----- save STORAGE & custom menu');
	// 型号
	// STORAGE 清除
	localStorage.removeItem(STORAGE_HIK_MANUALID_MODEL);
                var modelAttrTypeAttrJson = "";
	if(DISPLAY_MODEL_SELECT){
		var model_val = $("#selectModel").select2("val");
		if(model_val != ""){
			//console.log("型号>>>" + model_val);
			// -------------------------------
			// 定制型号保存到 STORAGE  属于永久性存储
			// -------------------------------
			localStorage.setItem(STORAGE_HIK_MANUALID_MODEL, model_val);
                                                modelAttrTypeAttrJson = gData_modelAttrMap.get(model_val);
		} 
	}
	// 属性组合
	KEY_TYPE_NAME_MAP.forEach((attrName, attrType)=>{
		// STORAGE 清除
		localStorage.removeItem(STORAGE_HIK_MANUALID_TYPE_ATTR + "," + attrType);

                                // 型号选择 & 勾选 的合并
		var attrValArray = new Array();

                               // 从型号取得
		if(modelAttrTypeAttrJson != "") {
			var model_AttrValue = modelAttrTypeAttrJson[attrType];
			modelAttrTypeAttrJson = gData_modelAttrMap.get(model_val);
			attrValArray.push(modelAttrTypeAttrJson[attrType]);
		}

                                // 从勾选取得
		// div id = ATTRTYPE / 当前属性项目 全部被勾选的属性值
		var checkedItemList = $("#div_"+attrType+" input:checked");
		if(checkedItemList.length > 0){
			for(var i=0; i < checkedItemList.length; i++){
				attrValArray.push(checkedItemList[i].value);
			}
		}

		// -------------------------------
		// 定制条件保存到 STORAGE  属于永久性存储
		// -------------------------------
		//console.log("STORAGE key >>>" , STORAGE_HIK_MANUALID_TYPE_ATTR + "," + attrType);
		//console.log("STORAGE content >>>" , attrValArray.toString());
		localStorage.setItem(STORAGE_HIK_MANUALID_TYPE_ATTR + "," + attrType, attrValArray.toString());
	});
	// 过滤逻辑
	// 根据 zTree 右树过滤 menu 
	var zTreeRight = $.fn.zTree.getZTreeObj("treeRight");
	var checkedNodes = zTreeRight.getCheckedNodes(true);
	g_guidArray = new Array();
	// 右树显示的 guid
	for(var i = 0; i < checkedNodes.length; i++) {
		var guid = checkedNodes[i].id;
		if(g_guidArray.indexOf(guid) == -1){
			g_guidArray.push(guid);
		}
	}
	// 必须显示 guid
	for(var i = 0; i < g_mustGuidArray.length; i++) {
		var guid = g_mustGuidArray[i];
		if(g_guidArray.indexOf(guid) == -1){
			g_guidArray.push(guid);
		}
	}
	// -------------------------------
	// TOPIC guid 保存到 STORAGE  属于永久性存储
	// -------------------------------
	if(g_guidArray.length > 0){
		// 保存 topic guid
		//console.log("STORAGE key >>>" , STORAGE_HIK_MANUALID_TOPIC);
		localStorage.setItem(STORAGE_HIK_MANUALID_TOPIC, g_guidArray.toString());
	}
	// 定制状态: TRUE
	IS_MENU_CUSTOM = true;
	// menu wt_menu_custom_tip
	menuCustomTipDisplay();
	// Menu根据 g_guidArray 重新显示
	menuHideAllMenuLi();
	menuShowByGuidDisplayArray();
	
	// 跳转到第一个topic
	console.log("custom confirm: open first page");
	gotoFirstPage();
}

// -----------------------------
// 
// 定制手册：重置按钮
// 更多章节：重置按钮
// 
function btnResetCustom(){
	console.log("--- 重置定制 ");
	// 隐藏tooltip
	$('#tip_message').fadeOut(1000);
	var confirmText = getLocalization("webhelp.custom.message.button.reset");
	hikConfirm(getLocalization("Tip"), confirmText, function(data){   
		//要回调的方法  
		if(data){
			IS_MENU_CUSTOM = false;
			// 型号列表 / 属性项目 / 更多章节 清除选中
			resetCustomModelAttr();
			resetCustomModelAttrMobile();
			resetCustoTopicMobile();
			// 重置 树
			cleanTree();
			// localStorage 删除
			cleanLocalStorage();
			// 可显示的目录Array
			g_guidArray = new Array();
			// 重置目录
			menuShowAllMenuLi();
			// 目录收缩
			menuCollapse();
			// 关闭
			btnCloseCustomWin();
		}
	}); 
}
// -----------------------------
// 目录：重置按钮
// 
function menuResetCustom(){
	var confirmText = getLocalization("webhelp.custom.message.menu.reset");
	hikConfirm(getLocalization("Tip"), confirmText, function(data){   
		//要回调的方法  
		if(data){
			IS_MENU_CUSTOM = false;
			// menu wt_menu_custom_tip
			menuCustomTipDisplay();
			// 型号列表 / 属性项目 / 更多章节 清除选中
			resetCustomModelAttr();
			resetCustomModelAttrMobile();
			resetCustoTopicMobile();
			// 重置 树
			cleanTree();
			// localStorage 删除
			cleanLocalStorage();
			// 可显示的目录Array
			g_guidArray = new Array();
			// 重置目录
			menuShowAllMenuLi();
			// 目录收缩
			menuCollapse();
			// 关闭
			btnCloseCustomWin();
		}
	}); 
}
function resetCustomModelAttr(){
	// 清除 型号列表 / 属性项目
	$("#selectModel").val("").select2();
	$("#selectModel").select2({width:"100%"});
	
	$(":checkbox").each(function(i, ele){
		$(ele).prop("checked", false);//未选中
	});
	//清除选中
	$('.active').each(function(){
		$(this).removeClass('active');
	});
	$('.li_open').each(function(){
		$(this).removeClass('li_open');
		$(this).addClass('li_close');
	});
}
function cleanLocalStorage(){
	// localStorage 型号 TOPIC
	localStorage.removeItem(STORAGE_HIK_MANUALID_MODEL);
	localStorage.removeItem(STORAGE_HIK_MANUALID_TOPIC);
	//属性
	KEY_TYPE_NAME_MAP.forEach((attrName, attrType)=>{
		localStorage.removeItem(STORAGE_HIK_MANUALID_TYPE_ATTR + ',' + attrType);
	});
}


// 目录：全部显示
function menuShowAllMenuLi(){
	$('.menu_toc_ul li').each(function(){
		$(this).removeClass('menu_hide');
	});
}
// 目录：全部隐藏
function menuHideAllMenuLi(){
	$('.menu_toc_ul li').each(function(){
		$(this).addClass('menu_hide');
	});
}

function showMenuCustomTip(){
	// 显示 wt_menu_custom_tip ,修改 .menu_toc_ul 高度
	$('.wt_menu_custom_tip').show();
	$('.menu_toc_ul').height('calc(100% - 18px - 66px - 48px);');
}
function hideMenuCustomTip(){
	// hide wt_menu_custom_tip ,修改 .menu_toc_ul 高度
	$('.wt_menu_custom_tip').hide();
}

// add 属性关联的guid
function matchAddGuid(custom_label){
	var attrType = $(custom_label).attr('data-type');
	var attrVal = $(custom_label).find('input').val();
	
	gMenu_menuAttrType_attrsMap.forEach((menuAttrsString, MENU_ATTRTYPE)=>{
		//console.log(MENU_ATTRTYPE + ":" + attrsString);
		if(menuAttrsString == null || menuAttrsString == ""){
			return;
		}
		var menuText = decodeURIComponent(MENU_ATTRTYPE.split(',')[0]);
		var guid = MENU_ATTRTYPE.split(',')[1];
		var menuAttrType = MENU_ATTRTYPE.split(',')[2];
		if(menuAttrType != attrType){
			return;
		}
		// menu 的attrType 的全部属性
		var menuAttrArray = menuAttrsString.split(',');
		// 判断勾选的属性值是否存在于 guid的属性集合中
		if(menuAttrArray.indexOf(attrVal) != -1){
			gTemp_addGuidArray.push(guid);
			gTemp_addTextArray.push(menuText);
		}
	});
}
// delete 属性关联的guid
function matchDeleteGuid(custom_label){
	var attrType = $(custom_label).attr('data-type');
	var attrVal = $(custom_label).find('input').val();
	gMenu_menuAttrType_attrsMap.forEach((menuAttrsString, MENU_ATTRTYPE)=>{
		if(menuAttrsString == null || menuAttrsString == ""){
			return;
		}
		var menuText = decodeURIComponent(MENU_ATTRTYPE.split(',')[0]);
		var guid = MENU_ATTRTYPE.split(',')[1];
		var menuAttrType = MENU_ATTRTYPE.split(',')[2];
		if(menuAttrType != attrType){
			return;
		}
		// menu 的attrType 的全部属性
		var menuAttrArray = menuAttrsString.split(',');
		// 判断勾选的属性值是否存在于 guid的属性集合中
		if(menuAttrArray.indexOf(attrVal) != -1){
			gTemp_deleteGuidArray.push(guid);
			gTemp_deleteTextArray.push(menuText);
		}
	});
}

// 备用
// 遍历全部 attrType 的全部属性值, 搜索GUID属性满足条件
function matchAttrTypeGuid(){
	gTemp_attrGroupGuidArray = new Array();
	gTemp_attrGroupTextArray = new Array();
	
	KEY_TYPE_NAME_MAP.forEach((attrVal, attrType)=>{
		$('#div_' + attrType + ' .wt_custom_label').each(function(){
			var isChecked = $(this).find('input').prop('checked');
			if(isChecked){
				var attrType = $(this).attr('data-type');
				var attrVal = $(this).find('input').val();
				// 搜索Menu属性满足条件
				matchMenuAttrs(attrType, attrVal);
			}
		});
	});
}
// 备用
// 搜索Menu属性满足条件
function matchMenuAttrs(attrType, attrVal){
	// 可替换 gMenu_menuAttrType_attrsMap forEach
	$('.menu_toc_ul li').each(function(){
		var a = $(this).find("a").eq(0);
		var aText = a.text();
		var guid = getAguid(a);
		if(guid == ""){
			return;
		}
		// menu li attrType的属性集合
		// 拼接 encode(Text) ,GUID,Attr TYPE
		var MENU_ATTRTYPE = encodeURIComponent(aText) + "," + guid + "," + attrType;
		var guidAttrCollection = gMenu_menuAttrType_attrsMap.get(MENU_ATTRTYPE);
		if(guidAttrCollection == null || guidAttrCollection == ""){
			return;
		}
		//guid 在当前attrType 对应的全部属性值
		var guidAttrList = guidAttrCollection.split(",");
		var isInclude = false;
		//判断勾选的属性值 是否存在于 GUID的属性值集合中
		if(guidAttrList.indexOf(attrVal) != -1
			&& gTemp_attrGroupGuidArray.indexOf(guid) == -1){
			// Guid的树形条件包含勾选的属性
			gTemp_attrGroupGuidArray.push(guid);
			gTemp_attrGroupTextArray.push(aText);
		}
	});
}

// 显示 选中的 属性项目
function checkAttrGroup(attrType, checkAttrString){
	if(checkAttrString != undefined && checkAttrString != "") {
		var checkAttrArray = checkAttrString.split(',');
		for (var i = 0; i < checkAttrArray.length; i++) {
			$('#' + attrType + '_CHECKBOX_' + checkAttrArray[i]).prop('checked', true);

		}
	}
}
// 型号选择, 更新 zTree
function select2Onchange(){
	$('#selectModel').off().on("select2:select", function(){
		var data = $(this).val();
		console.log("●●●型号选择：" + data);
		var checkAllText = getLocalization("webhelp.check.all");
		var cleanText = getLocalization("webhelp.check.clean");
		// 清空当前全部选中的属性
		KEY_TYPE_NAME_MAP.forEach((attrName, attrType)=>{
			//attrType 下面，所有 type=checkbox 
			$("#div_" + attrType + "  :checkbox").each(function(){
				// this = wt_custom_label>input 
				if($(this).prop('checked')){
					$(this).prop('checked', false);
					// 取消 -> 全选
					if($(this).prop('id') == 'check_all_' + attrType){
						$("#text_checkall_" + attrType).text(checkAllText);
					}
				}
			});
		});

		// 清空
		gTemp_addGuidArray = new Array();
		gTemp_addTextArray = new Array();
		gTemp_deleteGuidArray = new Array();
		gTemp_deleteTextArray = new Array();
		// zTree 清空
		cleanTree();
		
		// 清空型号，不需要更新属性操作
		if(data == ""){
			return;
		}
		// 勾选 对应属性  ， 更新 更多章节
		var attrsTypeObj = gData_modelAttrMap.get(data);
		KEY_TYPE_NAME_MAP.forEach((attrName, attrType)=>{
			if(attrsTypeObj[attrType].trim() != ""){
				var attrValArray = attrsTypeObj[attrType].split(',');
				console.log("checked: " + attrsTypeObj[attrType]);
				// 勾选 对应属性
				for(var i=0; i<attrValArray.length; i++){
					var attrNoChar = getAttrValueNoChar(attrValArray[i]);
					var checkbox_id = attrType + "_CHECKBOX_" + attrNoSpace;
					var inputCheckbox = $('#' + checkbox_id);
					$(inputCheckbox).prop("checked", true);//选中
					matchAddGuid($(inputCheckbox).parent());
				}
			}
		});
		// add 
		// 更新 zTree 内容
		updatezTree();
		// 清空
		gTemp_addGuidArray = new Array();
		gTemp_addTextArray = new Array();
		gTemp_deleteGuidArray = new Array();
		gTemp_deleteTextArray = new Array();
	});

}
// 属性值--符号替换为下划线
function getAttrValueNoChar(attrValue){
       // \w：匹配任何字母、数字和下划线（相当于 [a-zA-Z0-9_]）。
       // \u4e00-\u9fa5：匹配汉字（Unicode 范围）。
       // [^...]：表示匹配不在括号内的任何字符。
       // g：全局匹配，匹配所有符合条件的字符。
      const regex = /[^\w\u4e00-\u9fa5]/g;
      var attrValueNoChar = attrValue.replaceAll(regex, '_');
      return attrValueNoChar;	
}