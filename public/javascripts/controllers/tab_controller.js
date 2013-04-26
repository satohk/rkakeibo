
var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.controller) kakeibo.controller = {};


kakeibo.controller.TabController = function(wrapper_type){
	this.m_active_selector_id = null;
	this.m_wrapper_type = wrapper_type;
	this.m_selector2on_active = {};
}


kakeibo.controller.TabController.prototype.addPane = function(selector_id, on_active){
	var self = this;

	this.m_selector2on_active[selector_id] = on_active;
	$selector = $("#" + selector_id);
	$selector.click(function(e){
		if(e.target.id != self.m_active_selector_id){
			self.changePane(e.target.id);
		}
	});
}


kakeibo.controller.TabController.prototype.changePane = function(selector_id){
	if(this.m_active_selector_id != null){
		var $old_selector = $("#" + this.m_active_selector_id);
		$old_selector.closest(this.m_wrapper_type).removeClass("active");
		var $old_pane = $("#" + $old_selector.attr("pane_id"));
		$old_pane.hide();
	}
	var $target = $("#" + selector_id);
	$target.closest(this.m_wrapper_type).addClass("active");
	$("#" + $target.attr("pane_id")).show();

	this.m_active_selector_id = selector_id;

	if(this.m_selector2on_active[selector_id] != null){
		this.m_selector2on_active[selector_id](selector_id);
	}
}


kakeibo.controller.TabController.prototype.getActiveSelectorId = function(){
	return this.m_active_selector_id;
}


kakeibo.controller.TabController.prototype.activate = function(){
	if(this.m_selector2on_active[this.m_active_selector_id] != null){
		this.m_selector2on_active[this.m_active_selector_id]();
	}
}
