
console.log("●● custom_m.js ");

// -----------------------------
// Custom Mobile 
// 动态生成 定制手册
// 初始化 更多章节
function openCustomWinMobile() {
	console.log("open custom mobile  ");
	$('.wt_custom_mobile_container').removeClass('hidden');
	//计算  .wt_custom_mobile_content 高度
	//calcCustomMobileContentHeight();
	// 显示 属性组页面
	openCustomMobileModelAttr();
	// 型号
	if(DISPLAY_MODEL_SELECT && gData_modelAttrMap.size > 0){
		var optionHTMLS = "<option value=''>" + "</option>" + "\r\n";
		//gData_modelAttrMap 
		gData_modelAttrMap.forEach((attrCollection, model)=>{
			optionHTMLS += "<option value='" + model + "'>" + model  + "</option>" + "\r\n";
		});
		//显示 型号 selectModel  <option value="volvo">Volvo</option>
		$("#selectModelMobile").append(optionHTMLS);
		$("#selectModelMobile").select2({width:"100%"});
		
		// 显示型号
		var selected_model = localStorage.getItem(STORAGE_HIK_MANUALID_MODEL);
		if(selected_model != null && selected_model != ""){
			//设置型号选中
			$("#selectModelMobile").val(selected_model).select2();
			$("#selectModelMobile").select2({width:"100%"});
		} 
	
	} else {
		$('.wt_custom_mobile_common_model').remove();
	}
	// 从搜索页面跳转
	if(FROM_SEARCH_PAGE){
		
	}
		
	// 左侧 属性类型
	$('.wt_custom_mobile_functions').html("");
	// 激活的 attrType
	var activeType = undefined; 
	KEY_TYPE_NAME_MAP.forEach((attrName, attrType) => {
		if (activeType == undefined) {
			activeType = attrType;
		}
		var functionEle = $('<a data-toggle="tab"></a>');
		if (activeType === attrType) {
			functionEle.addClass('wt_custom_mobile_function').addClass('active');
			functionEle.attr('ref', attrType).attr('onclick', 'clickAttrType($(this))');
			functionEle.append(attrName);
			$('.wt_custom_mobile_functions').append(functionEle);
		} else {
			functionEle.addClass('wt_custom_mobile_function');
			functionEle.attr('ref', attrType).attr('onclick', 'clickAttrType($(this))');
			functionEle.append(attrName);
			$('.wt_custom_mobile_functions').append(functionEle);
		}
	})
	// 右侧 属性值
	$('.wt_custom_mobile_list').html("");
	gData_attrTypeAttrsMap.forEach((attrArray, attrType) => {
		// 勾选 已经选择的条件
		var checked_attr_array = localStorage.getItem(STORAGE_HIK_MANUALID_TYPE_ATTR + "," + attrType);
		if(checked_attr_array != null){
			checked_attr_array = checked_attr_array.split(',');
		} else {
			checked_attr_array = new Array();
		}
		
		// 一个 attrType 的全部属性集合
		var attrsEle = $('<div></div>');
		if (activeType === attrType) {
			attrsEle.attr('id', "div_" + attrType).addClass('wt_custom_mobile_attrs');
		} else {
			// 隐藏 属性集合
			attrsEle.attr('id', "div_" + attrType).addClass('wt_custom_mobile_attrs').addClass('hidden');
		}
		// checkbox 
		var checkboxAllEle = $('<div class="wt_custom_mobile_attr_checkbox"></div>');
		// 全选
		var DIV_TYPE = '#div_' + attrType;
		var checkAllText = getLocalization("webhelp.check.all");
		var checkAllEle = $('<div id="check_all_'+attrType+'"></div>').addClass('wt_custom_mobile_attr').addClass('all')
						.attr('onclick', 'attrTypeCheckAllMobile(\''+attrType+'\',$(this))');
		attrsEle.append(checkAllEle.append('<span id="text_checkall_' + attrType + '">' + checkAllText + '</span>').append(checkboxAllEle));
		for (var i = 0; i < attrArray.length; i++) {
			var name = attrArray[i];
			var attrEle = $('<div></div>').addClass('wt_custom_mobile_attr').attr('onclick', 'clickCustomAttr($(this))');
			// id, data-type
			// 把空格替换下划线
	                                var attrNoChar = getAttrValueNoChar(attrArray[i]);
	                                var checkbox_id = attrType + "_CHECKBOX_" + attrNoChar;
	                                var attrEle = $('<div></div>').addClass('wt_custom_mobile_attr').attr('onclick', 'clickCustomAttr($(this))');
	                                attrEle.attr('id', checkbox_id);
	                                attrEle.attr('data-type', attrType);
			if(checked_attr_array.indexOf(attrNoChar) > -1){
				//选中的项目
				attrEle.addClass('checked');
			}
			var nameSpan = $('<span></span>').append(attrArray[i]);
			// checkbox 
			var checkboxEle = $('<div class="wt_custom_mobile_attr_checkbox"></div>');
			attrsEle.append(attrEle.append(nameSpan).append(checkboxEle));
		}
		// 依次存入三个 attrType 的属性集合
		$('.wt_custom_mobile_list').append(attrsEle);
	});
	// 根据目录项目 显示更多章节 自动展开
	$('.wt_custom_mobile_topic_menu_ul li').each(function(){
		var a = $(this).find("a").eq(0);
		var guid = getAguid(a);
		var aText = a.text();
		if(g_guidArray.indexOf(guid) > -1){
			// 勾选项目
			$(a).find('.li_checkbox').eq(0).addClass('checked');
			// 展开全部上层节点
			open_li_ancestor($(this));
		}
	});
		
	/* Mobile: 更多章节： 增加 li_checkbox 的点击事件*/
	$('.wt_custom_mobile_topic_menu_ul .li_checkbox').unbind('click').bind('click', function(){
		var liPosition = $('.li_has_children').index($(this).parent().parent());
		if($(this).hasClass('checked')){
			$(this).removeClass('checked');
			// 子元素取消 & 父元素 remove checked
			setCustomMobileTopicMenu_UnCheckChildren($(this));
			setCustomMobileTopicMenu_UnCheckParent($(this));
		}else {
			$(this).addClass('checked');
			// 子元素取消 & 父元素 add checked
			setCustomMobileTopicMenu_CheckedChildren($(this));
			setCustomMobileTopicMenu_CheckedParent($(this));
		}
	}); 
}

// -----------------------------
// 
// 定制手册：确定按钮
// 
// --型号
// --属性
// --更多章节
// --STORAGE保存定制条件,运行定制目录逻辑
function btnConfirmCustomMobile(){
	var model_val;
	if(DISPLAY_MODEL_SELECT){
		model_val = $("#selectModelMobile").select2("val");
	}
	// 判断是否选择型号
	var hasAttrChecked = false;
	if(model_val != undefined && model_val != ""){
		hasAttrChecked = true;
	}
	//属性
	var checkedItemList = $(".wt_custom_mobile_attr.checked");
	if(checkedItemList.length > 0) {
		hasAttrChecked = true;
	}
	// 更多章节 wt_custom_mobile_topic_menu_ul
	var topicMenuCheckedList = $(".wt_custom_mobile_topic_menu_ul .li_checkbox.checked");
	if(topicMenuCheckedList.length > 0) {
		hasCondition = true;
	}
	
	
	if(!hasAttrChecked) {
		// 请先选择筛选条件。
		var alertText = getLocalization("webhelp.custom.check");
		hikAlert(getLocalization("Tip"), alertText, function(){   
            //要回调的方法 
        }); 
	} else {
		// STORAGE保存定制条件，运行定制目录逻辑
		execCustomMenuMobile();
		// 关闭定制窗口
		btnCloseCustomMobile();
		// 关闭目录
		closeMobileMenu();
	}
}
// -----------------------------
// 定制手册窗口：运行定制目录逻辑
// 
// --STORAGE保存定制条件
// --根据 topic menu_ul 过滤 menu
// 
// 
function execCustomMenuMobile(){
	console.log('----- Mobile: save STORAGE & custom menu');
	
	// 型号
	var model_val = $("#selectModelMobile").select2("val");
	if(DISPLAY_MODEL_SELECT && model_val != ""){
		console.log("型号>>>" + model_val);
		// -------------------------------
		// 定制型号保存到 STORAGE  属于永久性存储
		// -------------------------------
		localStorage.setItem(STORAGE_HIK_MANUALID_MODEL, model_val);
	} else {
		// STORAGE 清除
		localStorage.removeItem(STORAGE_HIK_MANUALID_MODEL);
	}
	// 属性组合过滤
	KEY_TYPE_NAME_MAP.forEach((attrName, attrType)=>{
		// STORAGE 清除
		localStorage.removeItem(STORAGE_HIK_MANUALID_TYPE_ATTR + "," + attrType);
		// div id = ATTRTYPE / 当前属性项目 全部被勾选的属性值
		var checkedItemList = $("#div_" + attrType+" .wt_custom_mobile_attr.checked");
		if(checkedItemList.length == 0){
			return;
		}
		var attrValArray = new Array();
		for(var i=0; i < checkedItemList.length; i++){
			attrValArray.push(checkedItemList[i].textContent);
		}
		// -------------------------------
		// 定制条件保存到 STORAGE  属于永久性存储
		// -------------------------------
		//console.log("STORAGE key >>>" , STORAGE_HIK_MANUALID_TYPE_ATTR + "," + attrType);
		//console.log("STORAGE content >>>" , attrValArray.toString());
		localStorage.setItem(STORAGE_HIK_MANUALID_TYPE_ATTR + "," + attrType, attrValArray.toString());
		
	});
	// 过滤逻辑
	g_guidArray = new Array();
	// 根据 topic menu_ul 过滤 menu
	var topicMenuCheckedList = $(".wt_custom_mobile_topic_menu_ul .li_checkbox.checked");
	for(var i = 0; i < topicMenuCheckedList.length; i++) {
		var guid = getAguid($(topicMenuCheckedList[i]).parent());
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
		// 过滤条件Array 转 json 字符串
		//console.log("STORAGE key >>>" , STORAGE_HIK_MANUALID_TOPIC);
		localStorage.setItem(STORAGE_HIK_MANUALID_TOPIC, g_guidArray.toString());
	}
	// 定制状态: TRUE
	IS_MENU_CUSTOM = true;
	// mobile_menu_custom_tip  定制状态消息提示
	menuCustomTipDisplayMobile();
	// Menu根据 g_guidArray 重新显示
	menuHideAllMenuLi();
	menuShowByGuidDisplayArray();

	//跳转到第一个topic
	console.log("custom mobile confirm: open first page");
	gotoFirstPage();
}
// -----------------------------
// 
// 更多章节：确定按钮
// --更多章节
// --STORAGE保存定制条件,运行定制目录逻辑
function btnConfirmTopicMobile(){
	var hasCondition = false;
	if($('.wt_custom_mobile_topic_menu_ul .li_checkbox.checked').length > 0){
		hasCondition = true;
	}
	if(!hasCondition) {
		// 请先选择目录。
		var alertText = getLocalization("webhelp.custom.tree.check");
		hikAlert(getLocalization("Tip"), alertText, function(){   
			//要回调的方法 
		}); 
	} else {
		// STORAGE保存定制条件，运行定制目录逻辑
		execCustomMenuMobile()
		// 关闭定制窗口
		btnCloseCustomMobile();
		// 关闭目录
		closeMobileMenu();
	}
}

// -----------------------------
// 
// 定制手册：取消按钮
// 
function btnCloseCustomMobile() {
	$('.wt_custom_mobile_container').addClass('hidden');
	// 删除页面项目
	$('#wt_custom_mobile_common_model').show();
	// 型号清空
	$("#selectModelMobile").val("").select2();
	$("#selectModelMobile").select2({width:"100%"});
	// 清空属性
	$('#wt_custom_mobile_attrs').empty();
}

// -----------------------------
// 
// 定制手册：重置按钮
// 更多章节：重置按钮
function btnResetCustomMobile() {
	console.log("--- 重置定制手册页面 ");
	var confirmText = getLocalization("webhelp.custom.message.button.reset");
	hikConfirm(getLocalization("Tip"), confirmText, function(data){   
		//要回调的方法  
		if(data){
			IS_MENU_CUSTOM = false;
			// mobile_menu_custom_tip  定制状态消息提示
			menuCustomTipDisplayMobile();
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
			// 切换到 ModelAttr 页面
			openCustomMobileModelAttr();
			// 关闭Mask
			btnCloseCustomMobile();
		}
	}); 
	
}
// --------------------
// 目录：重置按钮
function menuResetCustomMobile(){
	var confirmText = getLocalization("webhelp.custom.message.menu.reset");
	hikConfirm(getLocalization("Tip"), confirmText, function(data){   
		//要回调的方法  
		if(data){
			IS_MENU_CUSTOM = false;
			// mobile_menu_custom_tip  定制状态消息提示
			menuCustomTipDisplayMobile();
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
			// 切换到 ModelAttr 页面
			openCustomMobileModelAttr();
			// 关闭Mask
			btnCloseCustomMobile();
		}
	}); 
}
// -----------------------------
// Custom Mobile
// 定制手册：点击 属性类型 切换属性
// 
function clickAttrType(obj) {
	obj.siblings().removeClass('active');
	obj.addClass('active');
	var refId = obj.attr('ref');
	$.each($('.wt_custom_mobile_attrs'), function(i, ele) {
		if ($(ele).attr('id') === "div_" + refId) {
			$(ele).removeClass('hidden');
		} else {
			$(ele).addClass('hidden');
		}
	});
}

// -----------------------------
// Custom Mobile
// 定制手册：点击 全选 / 清除选中
//         保存临时属性条件
// 
function attrTypeCheckAllMobile(attrType, divObj) {
	var DIV_TYPE = "#div_" + attrType;
	if (divObj.hasClass('checked')) {
		// 取消
		divObj.removeClass('checked');
		divObj.siblings().removeClass('checked');
		// delete
		$(DIV_TYPE + " .wt_custom_mobile_attr:not(.all)").each(function(){
			// 每次一个动作属性，match属性关联的GUID
			matchDeleteGuidMobile($(this));
		});
	} else {
		// 全选
		divObj.addClass('checked');
		divObj.siblings().addClass('checked');
		// add
		$(DIV_TYPE + " .wt_custom_mobile_attr:not(.all)").each(function(){
			// 每次一个动作属性，match属性关联的GUID
			matchAddGuidMobile($(this));
		});
		
	}

	// 更多章节menu(wt_custom_mobile_topic_menu_ul) Mobile
	updateMobileTopicMenu();
	// 清空
	gTemp_addGuidArray = new Array();
	gTemp_addTextArray = new Array();
	gTemp_deleteGuidArray = new Array();
	gTemp_deleteTextArray = new Array();
}

// -----------------------------
// Custom Mobile
// 定制手册：点击 单一属性 
// 
function clickCustomAttr(obj) {
	console.log("checkbox click");
	if (obj.hasClass('checked')) {
		obj.removeClass('checked');
		// 取消全选
		var divCheckedAll = $(obj).parent().find('.all');
		divCheckedAll.removeClass('checked');
		// delete
		// 每次一个动作属性，match属性关联的GUID
		matchDeleteGuidMobile($(obj));
		
	} else {
		obj.addClass('checked');
		// add
		// 每次一个动作属性，match属性关联的GUID
		matchAddGuidMobile($(obj));
		
	}
	// 更多章节menu(wt_custom_mobile_topic_menu_ul) Mobile
	updateMobileTopicMenu();
	// 清空
	gTemp_addGuidArray = new Array();
	gTemp_addTextArray = new Array();
	gTemp_deleteGuidArray = new Array();
	gTemp_deleteTextArray = new Array();
}
function matchAddGuidMobile(divAttr){
	var attrType = $(divAttr).attr('data-type');
	var attrVal = $(divAttr).find('span').text();
	gMenu_menuAttrType_attrsMap.forEach((menuAttrsString, MENU_ATTRTYPE)=>{
		//console.log(MENU_ATTRTYPE + ":" + attrsString);
		if(menuAttrsString == null || menuAttrsString == ""){
			return;
		}
		var menuText = MENU_ATTRTYPE.split(',')[0];
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
function matchDeleteGuidMobile(divAttr){
	var attrType = $(divAttr).attr('data-type');
	var attrVal = $(divAttr).find('span').text();
	gMenu_menuAttrType_attrsMap.forEach((menuAttrsString, MENU_ATTRTYPE)=>{
		if(menuAttrsString == null || menuAttrsString == ""){
			return;
		}
		var menuText = MENU_ATTRTYPE.split(',')[0];
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


// -----------------------------
// Custom Mobile Topic
// 窗口切换： 显示 Topic Menu
// 
function openCustomMobileMoreTopic(){
	$('#div_custom_mobile_model_attr').hide();
	// 计算  wt_custom_mobile_topic_menu_ul 高度
    calcCustomMobileTopicMenulHeight();
	$('#div_custom_mobile_topic').show();
}
// -----------------------------
// Custom Mobile Topic
// 窗口切换: 显示属性组
// 
function openCustomMobileModelAttr() {
	//计算  .wt_custom_mobile_content 高度
	calcCustomMobileContentHeight();
	$('#div_custom_mobile_topic').hide();
	$('#div_custom_mobile_model_attr').show();
}

// -----------------------------
// 更多章节：
// --- 父元素& 子元素 checked
// --- 父元素& 子元素取消 checked
//
// 子元素 checked
function setCustomMobileTopicMenu_CheckedChildren(spanCheckbox){
	if (spanCheckbox.parent().parent().hasClass('li_has_children')) {
		var childLiArray = spanCheckbox.parent().parent().children('ul').children('li');
		for (var i = 0; i < childLiArray.length; i++) {
			var childSpanCheckbox = childLiArray.eq(i).children('a').eq(0).children('.li_checkbox');
			childSpanCheckbox.addClass('checked');
			// 递归 子元素 checked
			setCustomMobileTopicMenu_CheckedChildren(childSpanCheckbox);
		}
	}
}
// 父元素 checked
function setCustomMobileTopicMenu_CheckedParent(spanCheckbox){
	if(spanCheckbox.parents('ul').eq(0).hasClass('menu_ul_1')){
		// 是第一层 li
		return;
	}
	// 父元素 checked
	var parentSpanCheckbox = spanCheckbox.parents('ul').eq(0).prev().children('.li_checkbox');
	parentSpanCheckbox.addClass('checked');
	// 递归 父元素 checked
	setCustomMobileTopicMenu_CheckedParent(parentSpanCheckbox);
	
}
// 子元素 uncheck
function setCustomMobileTopicMenu_UnCheckChildren(spanCheckbox){
	if (spanCheckbox.parent().parent().hasClass('li_has_children')) {
		var childLiArray = spanCheckbox.parent().parent().children('ul').children('li');
		for (var i = 0; i < childLiArray.length; i++) {
			var childSpanCheckbox = childLiArray.eq(i).children('a').eq(0).children('.li_checkbox');
			childSpanCheckbox.removeClass('checked');
			// 递归 子元素 uncheck
			setCustomMobileTopicMenu_UnCheckChildren(childSpanCheckbox);
		}
	}
}
// 父元素 uncheck
function setCustomMobileTopicMenu_UnCheckParent(spanCheckbox){
	if(spanCheckbox.parents('ul').eq(0).hasClass('menu_ul_1')){
		// 是第一层 li
		return;
	}
	// 判断同级元素 是否 checked
	var siblingsLi = spanCheckbox.parents('li').eq(0).siblings();
	var hasSiblingsChecked = false;
	for (var i = 0; i < siblingsLi.length; i++) {
		if(siblingsLi.eq(i).children('a').eq(0).children('.li_checkbox').hasClass('checked')){
			hasSiblingsChecked = true;
			break;
		}
	}
	if(!hasSiblingsChecked) {
		// 同级元素没有 checked  取消父元素 checked
		var parentSpanCheckbox  = spanCheckbox.parents('ul').eq(0).prev().children('.li_checkbox');
		if(parentSpanCheckbox.length == 0){
			return;
		}
		parentSpanCheckbox.removeClass('checked');
		// 递归 取消父元素 checked
		setCustomMobileTopicMenu_UnCheckParent(parentSpanCheckbox);
	}
}

// 计算  .wt_custom_mobile_content 高度
function calcCustomMobileContentHeight(){
	// 40% - 80% 之间, 
	var winMaxHeight = Math.floor($(window).height() * 0.8);
	var winMinHeight = Math.floor($(window).height() * 0.4);
	// header: 50px    footer: 106px;
	var maxLine = Math.floor((winMaxHeight - 50 - 106 ) / 50);
	var minLine = Math.floor((winMaxHeight - 50 - 106 ) / 50);
	var attrLineCount = 0;
	if((maxLine - 2) > minLine){
		attrLineCount = maxLine - 2;
	} else {
		attrLineCount = minLine - 1;
	}
	var contentHeight = 52 * attrLineCount;
	$('.wt_custom_mobile_content').attr('style', 'height:' + contentHeight + 'px;');
}
// 计算  wt_custom_mobile_topic_menu_ul 高度
function calcCustomMobileTopicMenulHeight(){
	// 40% - 80% 之间, 
	var winMaxHeight = Math.floor($(window).height() * 0.8);
	var winMinHeight = Math.floor($(window).height() * 0.4);
	var maxLine = Math.floor(winMaxHeight / 50);
	var minLine = Math.floor(winMinHeight / 50);
	var ulLineCount = 0;
	if((maxLine - 2) > minLine){
		ulLineCount = maxLine - 2;
	} else {
		ulLineCount = minLine - 1;
	}
	var ulHeight = 50 * ulLineCount;
	$('#div_custom_mobile_topic_body').attr('style', 'height:' + ulHeight + 'px;');
}

// 更多章节： 隐藏必须显示项目
function hideCustomMobilTopicDisplay(){
	$('.wt_custom_mobile_topic_menu_ul .topicref').each(function(){
		var guid = getAguid($(this));
		if(g_mustGuidArray.indexOf(guid) > -1){
			$(this).parent().remove();
		}
	});
}

// 定制手册： 清除 型号列表 / 属性项目 
function resetCustomModelAttrMobile(){
	// 清除 型号列表
	$("#selectModelMobile").val("").select2();
	$("#selectModelMobile").select2({width:"100%"});
	// 清除 属性项目
	$(":checkbox").each(function(i, ele){
		$(ele).prop("checked", false);//未选中
	});
	//清除选中
	$('.wt_custom_mobile_attr.checked').each(function(){
		$(this).removeClass('checked');
	});
}

// 更多章节：清除选中
function resetCustoTopicMobile(){
	$('.wt_custom_mobile_topic_menu_ul .li_checkbox.checked').each(function(){
		$(this).removeClass('checked');
	});
}


// 型号选择, 更新 mobile_topic_menu
function select2OnchangeMobile(){
	$('#selectModelMobile').off().on("select2:select", function(){
		// 清空
		gTemp_addGuidArray = new Array();
		gTemp_addTextArray = new Array();
		gTemp_deleteGuidArray = new Array();
		gTemp_deleteTextArray = new Array();
		// wt_custom_mobile_topic_menu_ul 清空
		initMobileTopicMenu();
		
		// 清空当前全部选中的属性 , 清空更多章节的关联
		KEY_TYPE_NAME_MAP.forEach((attrName, attrType)=>{
			//attrType 下面，所有 type=checkbox 
			$("#div_" + attrType + "  .wt_custom_mobile_attr.checked").each(function(){
				$(this).removeClass('checked');
				// delete
				matchDeleteGuidMobile($(this));// div
			});
		});
		
		// delete
		// 更新 wt_custom_mobile_topic_menu_ul 内容
		updateMobileTopicMenu();
		// 清空
		gTemp_addGuidArray = new Array();
		gTemp_addTextArray = new Array();
		gTemp_deleteGuidArray = new Array();
		gTemp_deleteTextArray = new Array();
		
		var data = $(this).val();
		console.log("●●●型号选择：" + data);
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
					// 把空格替换下划线
		                                                var attrNoChar = getAttrValueNoChar(attrValArray[i]);
		                                                var checkbox_id = attrType + "_CHECKBOX_" + attrNoChar;
		                                                var inputCheckbox = $('#' + checkbox_id);
					$(inputCheckbox).addClass("checked");//选中
					matchAddGuidMobile($(inputCheckbox));// div
				}
			}
		});
		// add 
		// 更新 wt_custom_mobile_topic_menu_ul 内容
		updateMobileTopicMenu();
		// 清空
		gTemp_addGuidArray = new Array();
		gTemp_addTextArray = new Array();
		gTemp_deleteGuidArray = new Array();
		gTemp_deleteTextArray = new Array();
	});
	
}
// wt_custom_mobile_topic_menu_ul
function initMobileTopicMenu(){
	// 取消全部选择， 全部收缩
	$('.wt_custom_mobile_topic_menu_ul a').each(function(){
		var li = $(this).parent();
		var a = $(this);
		var aText = a.text();
		var li_checkbox = $(a).find('.li_checkbox');
		// 取消全部选择
		$(li_checkbox).removeClass('checked');
		// 全部收缩
		if($(li).hasClass('li_has_children')){
			$(li).addClass('li_close');
		}
		
	});
}
// wt_custom_mobile_topic_menu_ul
function updateMobileTopicMenu(){
	
	$('.wt_custom_mobile_topic_menu_ul a').each(function(){
		var li = $(this).parent();
		var a = $(this);
		var aText = a.text();
		var guid = getAguid(a);
		var li_checkbox = $(a).find('.li_checkbox');
		// add 
		if(gTemp_addGuidArray.indexOf(guid) > -1){
			$(li_checkbox).addClass("checked");
			if($(li).hasClass('li_has_children')){
				$(li).addClass('li_open');
			}
			// 需要勾选父节点
			checkAncestorMobileTopicMenu(li);
		}
		// delete 
		if(gTemp_deleteGuidArray.indexOf(guid) > -1){
			$(li_checkbox).removeClass("checked");
			if($(li).hasClass('li_has_children')){
				$(li).addClass('li_open');
			}
			// 需要取消父节点
			uncheckAncestorMobileTopicMenu(li);
			// 需要取消子节点 ？？？
		}
		
	});
}

// -----------------------
// 递归父节点 选中
function checkAncestorMobileTopicMenu(li){
	var parentLi = $(li).parent().parent();
	if($(parentLi).prop('nodeName') == "LI"){
		$(parentLi).addClass("li_open");
		$(parentLi).removeClass("li_close");
		// 选中
		var liCheckbox = $(parentLi).find("a .li_checkbox").eq(0);
		$(liCheckbox).addClass('checked');
		// 递归
		checkAncestorMobileTopicMenu(parentLi);
	}
}

// -----------------------
// [递归] 父节点 取消选中
// li: 
function uncheckAncestorMobileTopicMenu(li){
	var parentLi = $(li).parent().parent();
	if($(parentLi).prop('nodeName') == "LI"){
		if(hasChildrenCheckedMobile(parentLi)){
			// 保持选中
		} else {
			// 全部子节点没有被选中 取消选中
			var liCheckbox = $(parentLi).find("a .li_checkbox").eq(0);
			$(liCheckbox).removeClass('checked');
			$(parentLi).removeClass("li_open");
			$(parentLi).addClass("li_close");
			
			uncheckAncestorMobileTopicMenu(parentLi);
		}
	}
}
// -------------------------
// 判断当前的父节点  是否有子节点被选中
// parentLi: 当前的父节点
// 
function hasChildrenCheckedMobile(parentLi){
	var hasChecked = false;
	$(parentLi).find('ul .li_checkbox').each(function(){
		if($(this).hasClass('checked')){
			hasChecked = true;
		}
	});
	return hasChecked;
}