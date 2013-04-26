

var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.component) kakeibo.component = {};


kakeibo.component.LoadingScreen = function($parent){
	this.m_id = "loading-screen";

	var content_html =
		"<div id='" + this.m_id + "' class='loading-screen'>" +
		"<div class='loading-screen-img'>" +
		"</div></div>";

	$parent.append(content_html);
}


kakeibo.component.LoadingScreen.prototype.show = function(){
	$("#" + this.m_id).show();
}


kakeibo.component.LoadingScreen.prototype.hide = function(){
	$("#" + this.m_id).hide();
}
