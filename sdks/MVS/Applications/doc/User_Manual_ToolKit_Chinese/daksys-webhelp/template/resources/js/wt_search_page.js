
console.log("●● search_page.js ");


var RESTORE_PAGE = undefined;

// -----------------------------
// document.ready()
//
$(document).ready(function () {
	console.log("●●●● search_page > ready()");
	
	if($(window).width() > 768) {
		// PC
		// 显示 header title
		$('.wt_header_button_logo').show();
		$('.wt_footer_mobile').show()
		// 隐藏 search clean 按钮
		$('.wt_search_clean').hide();
		// 隐藏 cancel 按钮
		$('.wt_search_page_cancle').hide();
		// 计算滚动条部件高度
		var results_pagination_height = $(window).height() - 60 - 40 - 20;
		$('.wt_search_results_pagination').attr("style", "height:" + results_pagination_height + "px;");
		
	} else {
		// Mobile
		// 隐藏 header title
		$('.wt_header_button_logo').hide();
		$('.wt_footer_mobile').hide()
		// 显示 search clean 按钮
		$('.wt_search_clean').show();
		// 显示 cancel 按钮
		$('.wt_search_page_cancle').show();
		// 计算滚动条部件高度
		var results_pagination_height = $(window).height() - 56 - 40;
		$('.wt_search_results_pagination').attr("style", "height:" + results_pagination_height + "px;");
	}
    	
	// 跳转到 search.html
    try {
        var searchQuery = getParameter('searchQuery');
        if (searchQuery!='' && searchQuery!==undefined && searchQuery!='undefined') {
			searchQuery = decodeURIComponent(searchQuery);
			searchQuery = searchQuery.replace(/\+/g, " ");
            $('#textToSearch').val(searchQuery);
            executeQuery();
        }
    } catch (e) {
        debug(e);
    }
	
});

function cleanSearchText(){
	$('#textToSearch').val('');
}


function closeSearchPage(){
	// 从session 取得 搜索前地址
	var host = window.location.href;
	host = host.substring(0, host.lastIndexOf('/') +1);
	var restorePage = sessionStorage.getItem(RESTORE_PAGE);
	var gotoHtml = host + "index.html?guid=" + decodeURI(restorePage);;
	window.location.href = gotoHtml;
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

function debug(msg, object){ 
	console.log(msg, object); 
} 
