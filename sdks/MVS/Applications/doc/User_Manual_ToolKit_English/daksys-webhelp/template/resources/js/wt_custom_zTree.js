
console.log("●● zTree.js ");
/*
 * ------------------------------------------------------------------
 *
 * zTree
 *
 */
var settingLeft = {
	view: {
		showIcon: showIconForTree
	},
	check: {
		enable: true,
		autoCheckTrigger: true
	},
	data: {
		simpleData: {
			enable: true
		}
	},
	callback: {
		onCheck: onCheck
	}
};
var settingRight = {
	view: {
		showIcon: showIconForTree
	},
	data: {
		simpleData: {
			enable: true
		}
	}
};

var leftMenuNodes = new Array();
var rightMenuNodes = new Array();


$(document).ready(function(){
	// checkbox event: 左树全选/取消
	$("#check_all_tree").change(function(){
		var zTreeLeft = $.fn.zTree.getZTreeObj("treeLeft");
		var leftNodes = zTreeLeft.getNodes();
		//setSetting(false, false, false, false);
		if(this.checked){
			zTreeLeft.expandAll(true); // 全展开
			leftTreeCheckedAll(zTreeLeft, leftNodes, true);
			calcLeftCount();
		} else {
			leftTreeCheckedAll(zTreeLeft, leftNodes, false);
			calcLeftCount();
		}
	});
});


function setSetting(parentCheck, sonCheck, parentUncheck, sonUncheck) {
	// 勾选父子关联关系
	var zTreeLeft = $.fn.zTree.getZTreeObj("treeLeft");
	var zTreeRight = $.fn.zTree.getZTreeObj("treeRight");
	var checkSetting = "", uncheckSetting = "";
	if(parentCheck) {
		checkSetting += "p";
	}
	if(sonCheck) {
		checkSetting += "s";
	}
	if(parentUncheck) {
		uncheckSetting += "p";
	}
	if(sonUncheck) {
		uncheckSetting += "s";
	}
	var type = { 
				"Y": checkSetting, 
				"N": uncheckSetting
				}; 
	zTreeLeft.setting.check.chkboxType = type;
	
}

function onCheck(e, treeId, treeNode) {
	//console.log(treeNode.name);
	cancelHalf(treeNode)
	treeNode.checkedEx = true;
	calcLeftCount();
	calcRightCount();	
}
function cancelHalf(treeNode) {
	if (treeNode.checkedEx) return;
	var zTree = $.fn.zTree.getZTreeObj("treeLeft");
	treeNode.halfCheck = false;
	zTree.updateNode(treeNode);	
}
function showIconForTree(treeId, treeNode) {
	// 隐藏ICON
	return false;
};



// -----------------------------
// 
// zTree: 打开定制窗口初始化 
// 
// 
function initzTree(){
	console.log("●●●●●● init zTree");
	var root = $('.menu_toc_ul').eq(0);
	var parentId = 0;
	// 左树：
	// 显示全部目录内容
	// 是定制状态：勾选menu显示的内容
	// 必须显示项目：不显示
	leftMenuNodes = new Array();
	initLeftTree(root, parentId);
	$.fn.zTree.init($("#treeLeft"), settingLeft, leftMenuNodes); // leftMenuNodes
	calcLeftCount();

	// 右树: 
	// 是定制状态： 显示menu的内容
	// 必须显示项目：不显示
	rightMenuNodes = new Array();
	initRightTree(root, parentId);
	$.fn.zTree.init($("#treeRight"), settingRight, rightMenuNodes); // rightMenuNodes
	calcRightCount();
	
	setSetting(true, true, true, true);
}
// -----------------------------
// 左树
// 
// 显示全部目录内容
// 是定制状态：勾选menu显示的内容
// 必须显示项目：不显示
function initLeftTree(curLiNode, parentId) {
	curLiNode.children('.menu_ul').eq(0).children('li').each(function(){
		var isHide = $(this).hasClass('menu_hide');
		var a = $(this).find("a").eq(0);// data-HIKFILTERDISPLAY
		var aDisplay = a.attr("data-HIKFILTERDISPLAY");
		var aText = a.text();
		var guid = getAguid(a);
		var itemLeft = {
            id: guid,  
            pId : parentId,
            name: aText,
			isHidden: false
        }
		// --------- 左树 ---------
		// 是定制状态：勾选menu显示的内容
		if(IS_MENU_CUSTOM && isHide == false){
			itemLeft.checked = true;
			itemLeft.open = true;
		}
		if(g_guidArray.indexOf(guid) > -1) {
			itemLeft.checked = true;
			itemLeft.open = true;
		}
		// 必须显示项目 不显示
		if(g_mustGuidArray.indexOf(guid) > -1) {
			itemLeft.checked = true;
			itemLeft.open = true;
			itemLeft.chkDisabled = true;
			itemLeft.isHidden = true;
			
		}
		// 左树
		leftMenuNodes.push(itemLeft);
		// 判断是否有UL  递归调用
		if($(this).children(".menu_ul").length > 0) {
			initLeftTree($(this), guid);
		}
    });
}
// -----------------------------
// 右树
// 
// 是定制状态：勾选menu显示的内容
// 必须显示项目：不显示
function initRightTree(curLiNode, parentId){
	curLiNode.children('.menu_ul').eq(0).children('li').each(function(){
		var isHide = $(this).hasClass('menu_hide');
		var a = $(this).find("a").eq(0);// data-HIKFILTERDISPLAY
		var aDisplay = a.attr("data-HIKFILTERDISPLAY");
		var aText = a.text();
		var guid = getAguid(a);
		var itemLeft = {
            id: guid,  
            pId : parentId,
            name: aText
        }
		// --------- 右树 ---------
		var itemRight = {
            id: guid,  
            pId : parentId,
            name: aText
        }
		// 定制状态 && 显示的menu项目 勾选
		if(IS_MENU_CUSTOM && isHide == false) {
			//
			itemRight.checked = true;
			itemRight.open = true;
		} else {
			itemRight.checked = false;
			itemRight.isHidden = true;
		}
		if(g_mustGuidArray.indexOf(guid) > -1) {
			// 必须显示项目 不显示
			itemRight.checked = false;
			itemRight.isHidden = true;
		}
		rightMenuNodes.push(itemRight);
		// 判断是否有UL  递归调用
		if($(this).children(".menu_ul").length > 0) {
			initRightTree($(this), guid);
		}
    });
}


function calcLeftCount() {
	var zTreeLeft = $.fn.zTree.getZTreeObj("treeLeft");
	var checkCount = zTreeLeft.getCheckedNodes(true).length;
	var nocheckCount = zTreeLeft.getCheckedNodes(false).length;
	$("#checkCountText").text(checkCount);
	$("#nocheckCountText").text(nocheckCount);

}
function calcRightCount() {
	var zTreeRight = $.fn.zTree.getZTreeObj("treeRight");
	var count = zTreeRight.getCheckedNodes(true).length;
	$("#countText").text(count);

}

// -----------------------------
// 
// zTree: 定制窗口 选中/取消 属性项目更新树内容
// 
// 
function updatezTree(){
	// DEBUG 
	//showCustomTopicDiv();
	// DEBUG
	console.log("●●●●●● update zTree");
	var root = $('.menu_toc_ul').eq(0);
	var parentId = 0;
	updateLeftTree(root);
	$.fn.zTree.init($("#treeLeft"), settingLeft, leftMenuNodes); // leftMenuNodes
	calcLeftCount();
	
	// 写入右树
	updateRightTree(rightMenuNodes);
	$.fn.zTree.init($("#treeRight"), settingRight, rightMenuNodes); // rightMenuNodes
	calcRightCount();
	
}

// -----------------------------
// 
// 更新左树: 遍历左树 leftMenuNodes 数据 
// 
// 新增的预选项目：勾选
// 取消的预先项目：取消勾选
// 
function updateLeftTree(){
	// 遍历左树 leftMenuNodes 数据 
	for(var i=0; i< leftMenuNodes.length; i++){
		var guid = leftMenuNodes[i].id;
		// 属性组的预选项目匹配的 GUID：勾选
		/* if(gTemp_attrGroupGuidArray.indexOf(guid) > -1){
			console.log('== Attr Group :' + leftMenuNodes[i].name);
			leftMenuNodes[i].checked = true;
			leftMenuNodes[i].open = true;
			// 需要勾选父节点
			checkAncestorTreeNode(leftMenuNodes, leftMenuNodes[i].pId);
		} */
		// 更多章节的预选章节 GUID
		/* if(gTemp_topicGuidArray.indexOf(guid) > -1){
			console.log('== Topic :' + leftMenuNodes[i].name);
			leftMenuNodes[i].checked = true;
			leftMenuNodes[i].open = true;
			// 需要勾选父节点
			checkAncestorTreeNode(leftMenuNodes, leftMenuNodes[i].pId, false);
		} */
		// add 
		if(gTemp_addGuidArray.indexOf(guid) > -1){
			leftMenuNodes[i].checked = true;
			leftMenuNodes[i].open = true;
			// 需要勾选父节点
			checkAncestorTreeNode(leftMenuNodes, leftMenuNodes[i].pId);
		}
		// delete 
		if(gTemp_deleteGuidArray.indexOf(guid) > -1){
			if(hasChildrenChecked(leftMenuNodes, leftMenuNodes[i])){
				// 子代有选中，当前节点不能取消选中
				leftMenuNodes[i].checked = true;
				leftMenuNodes[i].open = true;
			} else {
				// 可以取消选中
				leftMenuNodes[i].checked = false;
				leftMenuNodes[i].open = false;
				// 需要取消父节点
				uncheckAncestorTreeNode(leftMenuNodes, leftMenuNodes[i].pId);
			}
		}
	}
}

// -----------------------------
// 
// 更新右树: 遍历右树 rightMenuNodes 数据 
// 
// 新增的预选项目：显示
// 取消的预先项目：不显示
// 必须显示项目 显示
// 
function updateRightTree(){
	for(var i = 0; i < rightMenuNodes.length; i++){
		var guid = rightMenuNodes[i].id;
		// add 
		if(gTemp_addGuidArray.indexOf(guid) > -1){
			rightMenuNodes[i].checked = true;
			rightMenuNodes[i].open = true;
			rightMenuNodes[i].isHidden = false;
			// 需要勾选父节点
			checkAncestorTreeNode(rightMenuNodes, rightMenuNodes[i].pId);
		}
		// delete 
		if(gTemp_deleteGuidArray.indexOf(guid) > -1){
			rightMenuNodes[i].checked = false;
			rightMenuNodes[i].open = true;
			rightMenuNodes[i].isHidden = true;
			// 需要取消父节点
			uncheckAncestorTreeNode(rightMenuNodes, rightMenuNodes[i].pId, true);
			// 需要取消子节点 ???
		}

	}
	// 判断是否有显示的项目
	var hasNodeDisplay = false;
	for(var i = 0; i < rightMenuNodes.length; i++){
		if(rightMenuNodes[i].isHidden == false && g_mustGuidArray.indexOf(rightMenuNodes[i].id) == -1){
			hasNodeDisplay = true;
			break;
		}
	}

}

// -----------------------------
// 
// zTree: 清空
// 左树：清空所有选中
// 右树：不显示
// 
function cleanTree(){
	console.log("●●●●●● clean zTree");
	
	var root = $('.menu_toc_ul').eq(0);
	var parentId = 0;
	// 左树：清空所有选中
	leftMenuNodes = new Array();
	cleanLeftTree(root, parentId);
	$.fn.zTree.init($("#treeLeft"), settingLeft, leftMenuNodes); // leftMenuNodes
	calcLeftCount();

	// 右树：不显示
	rightMenuNodes = new Array();
	cleanRightTree(root, parentId);
	$.fn.zTree.init($("#treeRight"), settingRight, rightMenuNodes); // rightMenuNodes
	calcRightCount();
	
	setSetting(true, true, true, true);
}
function cleanLeftTree(curLiNode, parentId){
	curLiNode.children('.menu_ul').eq(0).children('li').each(function(){
		var isHide = $(this).hasClass('menu_hide');
		var a = $(this).find("a").eq(0);// data-HIKFILTERDISPLAY
		var aDisplay = a.attr("data-HIKFILTERDISPLAY");
		var aText = a.text();
		var guid = getAguid(a);
		var itemLeft = {
            id: guid,  
            pId : parentId,
            name: aText,
			isHidden: false,
			checked: false,
			open: false
        }
		// 必须显示项目 不显示
		if(g_mustGuidArray.indexOf(guid) > -1) {
			itemLeft.checked = true;
			itemLeft.open = true;
			itemLeft.chkDisabled = true;
			itemLeft.isHidden = true;
			
		}
		// 左树
		leftMenuNodes.push(itemLeft);
		// 判断是否有UL  递归调用
		if($(this).children(".menu_ul").length > 0) {
			cleanLeftTree($(this), guid);
		}
    });
}

function cleanRightTree(curLiNode, parentId){
	curLiNode.children('.menu_ul').eq(0).children('li').each(function(){
		var a = $(this).find("a").eq(0);// data-HIKFILTERDISPLAY
		var aText = a.text();
		var guid = getAguid(a);
		var itemRight = {
            id: guid,  
            pId : parentId,
            name: aText,
			open: false,
			checked: false,
			isHidden: true
        }
		if(g_mustGuidArray.indexOf(guid) > -1) {
			// 必须显示项目 不显示
			itemRight.checked = false;
			itemRight.isHidden = true;
		}
		rightMenuNodes.push(itemRight);
		// 判断是否有UL  递归调用
		if($(this).children(".menu_ul").length > 0) {
			cleanRightTree($(this), guid);
		}
    });
}
function expandTree(){
	var zTreeLeft = $.fn.zTree.getZTreeObj("treeLeft");
	zTreeLeft.expandAll(true);
	$("#a_tree_expand").hide();
	$("#a_tree_collapse").show();
}
function collapseTree(){
	var zTreeLeft = $.fn.zTree.getZTreeObj("treeLeft");
	zTreeLeft.expandAll(false);
	$("#a_tree_collapse").hide();
	$("#a_tree_expand").show();
}
// -------------------
// 点击添加
//
function moveToRightTree() {
	var zTreeLeft = $.fn.zTree.getZTreeObj("treeLeft");
	var zTreeRight = $.fn.zTree.getZTreeObj("treeRight");

	// 右树 清空
	rightMenuNodes = new Array();
	cleanRightTree($('.menu_toc_ul').eq(0), 0);
	$.fn.zTree.init($("#treeRight"), settingRight, rightMenuNodes); // rightMenuNodes
	//calcRightCount();
	
	// 左树选中的章节
	var leftCheckedNodes = zTreeLeft.getCheckedNodes(true);
	leftCheckedNodes.map(function(leftItem){
		// 左树选中的章节，在右树对应的Node 显示
		var rightMatchNode = findNodeById(zTreeRight.getNodes(), leftItem.id);
		if(rightMatchNode) {
			rightMatchNode.checked = true;
			if(g_mustGuidArray.indexOf(rightMatchNode.id) > -1) {
				// 必须显示项目 不显示
				rightMatchNode.checked = false;
				rightMatchNode.isHidden = true;
			}
			zTreeRight.showNode(rightMatchNode);
			zTreeRight.expandNode(rightMatchNode, true, null, null, null);
			console.log("右树显示：" + rightMatchNode.name);
			calcRightCount();
		}
	});
}


function leftTreeCheckedAll(zTree, nodes, checkFlag) {
	nodes.map(function(item){
		if(item.children != undefined && item.children.length > 0) {
			leftTreeCheckedAll(zTree, item.children, checkFlag);
		}
		// 左树 全部勾选
		item.checked = checkFlag;
		item.halfCheck = false;
		zTree.updateNode(item);
	});
}

function getAllNode(rootNodes) {
	var allNodeArray = new Array();
	rootNodes.map(function(item){
		allNodeArray.push(item);
		if(item.children != undefined && item.children.length > 0) {
			allNodeArray = allNodeArray.concat(getAllNode(item.children));
		}
	});
	return allNodeArray;
}

function findNodeById(nodes, id) {
	for(var i = 0; i < nodes.length; i++) {
		var item = nodes[i];
		if(item.id == id){
			return item;
		} else if(item.children && item.children.length > 1) {
			var tempNode = findNodeById(item.children, id);
			if(tempNode) return tempNode;
		}
	}
	
}

// -----------------------------
// 
// 更多章节：确定按钮
// --更多章节
// --STORAGE保存定制条件,运行定制目录逻辑
// 
function btnConfirmTree(){
	var hasCondition = false;
	// 更多章节
	var zTreeRight = $.fn.zTree.getZTreeObj("treeRight");
	var checkedNodes = zTreeRight.getCheckedNodes(true);
	if(checkedNodes.length > 0){
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
		execCustomMenu()
		// 关闭窗口
		btnCloseCustomWin();
	}
}



// -----------------------------
// 
// 定制手册窗口：切换 定制手册 / 更多章节
//        定制页面选中的项目，需要暂存，当作  更多章节预选项目
// 
function showCustomTopicDiv(){
	console.log('show more section');
	// 隐藏tooltip
	$('#tip_message').fadeOut(1000);
	$("#div_custom_model_attr").hide();
	
	// 更多章节 zTree.js
	//showMoreSection();
	
	var tree_body_height = $(window).height() - 200;
	if(tree_body_height > 400){
		tree_body_height = 400;
	}
	
	$(".wt_custom_tree_body").attr('style','height: ' + tree_body_height + "px;");
	$("#div_custom_topic").show();
	// 计算 wt_custom_tree_body 可显示位置
	var customWin = $("#div_custom_win");  
	var posTop = ($(window).height() - customWin.height()) / 2;
	var posLeft = ($(window).width() - customWin.width()) / 2;
	customWin.css({"top": posTop , "left": posLeft}).fadeIn();   
}




// 递归父节点 选中
function checkAncestorTreeNode(treeNodes, childPid){
	for(var i = 0; i < treeNodes.length; i++){
		if(treeNodes[i].id == childPid){
			treeNodes[i].checked = true;
			treeNodes[i].open = true;
			treeNodes[i].isHidden = false;
			checkAncestorTreeNode(treeNodes, treeNodes[i].pId);
		}
	}
}
// -----------------------
// [递归] 父节点 取消选中 (需要判断子代是否有选中)
// treeNodes: 树的全部节点;
// childPid: 子节点的父节点id
// hideFlg: 是否隐藏节点 右树：true
function uncheckAncestorTreeNode(treeNodes, childPid, hideFlg){
	for(var i = 0; i < treeNodes.length; i++){
		if(treeNodes[i].id == childPid){
			if(hasChildrenChecked(treeNodes, treeNodes[i].id)){
				// 保持选中
				treeNodes[i].checked = true;
				treeNodes[i].open = true;
			} else {
				// 全部子节点没有被选中 取消选中
				treeNodes[i].open = false;
				treeNodes[i].checked = false;
				treeNodes[i].isHidden = false;
				uncheckAncestorTreeNode(treeNodes, treeNodes[i].pId, hideFlg);
			}
			if(hideFlg){
				treeNodes[i].isHidden = true;
			}
		}
	}
}
// -------------------------
// 判断currentNode  是否有子代是否有选中
// treeNodes: 树的全部节点
// currentNode: 当前节点
function hasChildrenChecked(treeNodes, currentNode){
	for(var i = 0; i < treeNodes.length; i++){
		// treeNodes[i]是 currentNode 的 子代，判断 treeNodes[i]是否被选中
		if(treeNodes[i].pId == currentNode.id){
			if(treeNodes[i].checked){
				return true;
			}
		}
	}
	return false;
}
