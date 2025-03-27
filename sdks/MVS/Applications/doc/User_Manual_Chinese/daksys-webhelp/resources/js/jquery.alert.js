(function($) {        
    $.alerts = {         
        alert: function(title, message, callback) {  
            if( title == null ) title = 'Alert';  
            $.alerts._show(title, message, null, 'alert', function(result) {  
                if( callback ) callback(result);  
            });  
        },  
           
        confirm: function(title, message, callback) {  
            if( title == null ) title = 'Confirm';  
            $.alerts._show(title, message, null, 'confirm', function(result) {  
                if( callback ) callback(result);  
            });  
        },  
               
          
        _show: function(title, msg, value, type, callback) {
			var okText = getLocalization("webhelp.ok");
			var cancelText = getLocalization("webhelp.cancel");
			var _html = "";  
   
			_html += '<div id="mb_box"></div>';
			// dialog
			_html += '<div id="mb_dialog" class="pop-box">';
			// header
			_html += '<div id="mb_header">';
			_html += '<div id="mb_title">' + title + '</div>';
			_html += '<div id="mb_close" ><div id="mb_close_button"></div></div>';
			_html += '</div>';  
			// message
			_html += '<div id="mb_msg">' + msg + '</div>';
			// button
			_html += '<div id="mb_btnbox">';  
			if (type == "alert") {  
				_html += '<input id="mb_btn_ok" type="button" value="'+okText+'" />';  
			}  
			if (type == "confirm") {  
				_html += '<input id="mb_btn_ok" type="button" value="'+okText+'" />';  
				_html += '<input id="mb_btn_no" type="button" value="'+cancelText+'" />';  
			}  
			// btnbox end
			_html += '</div>';  
		    // dialog end
			_html += '</div>';  
			//必须先将_html添加到body，再设置Css样式  
			$("body").append(_html); GenerateCss();  
           
            switch( type ) {  
                case 'alert':  
          
                    $("#mb_btn_ok").click( function() {  
                        $.alerts._hide();  
                        if( callback ) callback(true);  
                    });  
                    $("#mb_btn_ok").focus().keypress( function(e) {  
                        if( e.keyCode == 13 || e.keyCode == 27 ) $("#mb_btn_ok").trigger('click');  
                    });  
					$("#mb_close").click( function() {  
                        $.alerts._hide();  
                        if( callback ) callback(false);  
                    }); 
                break;  
                case 'confirm':  
                     
                    $("#mb_btn_ok").click( function() {  
                        $.alerts._hide();  
                        if( callback ) callback(true);  
                    });  
                    $("#mb_btn_no").click( function() {  
                        $.alerts._hide();  
                        if( callback ) callback(false);  
                    });  
					$("#mb_close").click( function() {  
                        $.alerts._hide();  
                        if( callback ) callback(false);  
                    });  
                    $("#mb_btn_no").focus();  
                    $("#mb_btn_ok, #mb_btn_no").keypress( function(e) {  
                        if( e.keyCode == 13 ) $("#mb_btn_ok").trigger('click');  
                        if( e.keyCode == 27 ) $("#mb_btn_no").trigger('click');  
                    });  
                break;
            }  
        },  
        _hide: function() {  
             $("#mb_box,#mb_dialog").remove();  
        }  
    }  
    // Shortuct functions  
    hikAlert = function(title, message, callback) {  
        $.alerts.alert(title, message, callback);  
    }  
       
    hikConfirm = function(title, message, callback) {  
        $.alerts.confirm(title, message, callback);  
    };  
           
   
      
      //生成Css  
  var GenerateCss = function () {  
    //console.log('Alert.js === CSS ');
    $("#mb_box").css({ 
		width: '100%', 
		height: '100%', 
		zIndex: '99999', 
		position: 'fixed',  
		filter: 'Alpha(opacity=60)', 
		backgroundColor: 'black', 
		top: '0', 
		left: '0', 
		opacity: '0.5'
    });  
	
	var dialog_width = 350;
	//屏幕宽 < dialog_width
	if(document.documentElement.clientWidth < dialog_width){
		dialog_width =  document.documentElement.clientWidth - 40;
	}
    $("#mb_dialog").css({ 
		display: 'block',
		width: dialog_width + 'px',
		height: 'auto',
		maxHeight: '500px',
		position: 'fixed',
		backgroundColor: '#FFFFFF',
		margin: '0',
		zIndex: '999999', 
    });  
	
    $("#mb_header").css({ 
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '0px 16px 0px 16px',
		margin: '0',
		width: '100%',  
		height: '44px',
		borderBottom: '1px solid #E8E8E8',
    });  
   
    $("#mb_title").css({ 
		fontSize: '14px', 
		lineHeight: '20px',
		color: '#000000', 
    });  
   
    $("#mb_msg").css({ 
		padding: '16px 16px', 
		textAlign:'left', 
		fontSize: '14px' ,
		lineHeight: '18px', 
		color:'#333333' 
    });  
   
    $("#mb_close").css({ 
		display: 'block', 
		textAlign: 'right', 
		lineHeight: '20px', 
		
    });  
	$("#mb_close_button").css({ 
		content: "",
		display: 'inline-block',
		width: '14px',
		height: '14px',
		backgroundImage: 'url(daksys-webhelp/resources/js/images/close@2x.png)',
		backgroundSize: '14px 14px',
		cursor: 'pointer'
    });  
   
    $("#mb_btnbox").css({ 
		padding: '12px 16px', 
		margin: '0',
		textAlign: 'center' ,
		height: '56px',
		borderTop: '1px solid #E8E8E8',
	});  
    $("#mb_btn_ok").css({ 
		width: '80px', 
		height: '32px', 
		fontSize: '14px',
		color: '#FFFFFF;',
		backgroundColor: '#D71820',
		borderRadius: '4px',
		border: '1px solid #D71820',
	});  
    /* $("#mb_btn_ok").css({ backgroundColor: '#41a259' });   */
    $("#mb_btn_no").css({ 
		width: '80px', 
		height: '32px', 
		fontSize: '14px',
		color: '#666666', 
		backgroundColor: '#FFFFFF', 
		border: '1px solid #BBBBBB',
		borderRadius:'4px',
		marginLeft: '40px',
	});  
   
   
    //右上角关闭按钮hover样式  
    $("#mb_close_button").hover(function () {  
      $(this).css({ backgroundColor: '#DDD' });  
    }, function () {  
      $(this).css({ backgroundColor: '#FFF' });  
    });  
   
    var _widht = document.documentElement.clientWidth; //屏幕宽  
    var _height = document.documentElement.clientHeight; //屏幕高  
   
    var boxWidth = $("#mb_dialog").width();  
    var boxHeight = $("#mb_dialog").height();  
   
    // dialog居中  
    $("#mb_dialog").css({ top: (_height - boxHeight) / 2 + "px", left: (_widht - boxWidth) / 2 + "px" });  
  }  
   
  
})(jQuery);