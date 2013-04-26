

var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.controller) kakeibo.controller = {};


kakeibo.controller.SettingTabController = function(context){
	this.m_context = context;

	this.initSubpane();
	this.initComponents();
}


kakeibo.controller.SettingTabController.prototype.initSubpane = function(){
	var self = this;

	this.m_budget_controller = new kakeibo.controller.SettingTabBudgetController();
	this.m_category_controller = new kakeibo.controller.SettingTabCategoryController();
	this.m_subpane_controller = new kakeibo.controller.TabController("li");

	this.m_subpane_controller.addPane("setting-pane-view-selector", null);
	this.m_subpane_controller.addPane("setting-pane-csv-selector", null);
	this.m_subpane_controller.addPane("setting-pane-category-selector", function(){self.m_category_controller.onActivated()});
	this.m_subpane_controller.addPane("setting-pane-budget-selector", function(){self.m_budget_controller.onActivated()});
	// this.m_subpane_controller.addPane("setting-pane-category-modify-selector", null);

	this.m_subpane_controller.changePane("setting-pane-view-selector");
}


kakeibo.controller.SettingTabController.prototype.initComponents = function(){
	var self = this;

	$("#setting-pane-cancel").click(function(e){
		var selector_id = self.m_subpane_controller.getActiveSelectorId();
		if(selector_id == "setting-pane-view-selector"){
			self.initViewSubpane();
		}
		else if(selector_id == "setting-pane-csv-selector"){
			// do nothing
		}
		else if(selector_id == "setting-pane-category-selector"){
			self.m_category_controller.cancel();
		}
		else if(selector_id == "setting-pane-budget-selector"){
			self.m_budget_controller.cancel();
		}
		else if(selector_id == "setting-pane-account-selector"){
			// do nothing
		}
	});

	$("#setting-pane-submit").click(function(e){
		var selector_id = self.m_subpane_controller.getActiveSelectorId();
		if(selector_id == "setting-pane-view-selector"){
			self.submitViewSubpane();
		}
		else if(selector_id == "setting-pane-csv-selector"){
			// do nothing
		}
		else if(selector_id == "setting-pane-category-selector"){
			self.m_category_controller.submit();
		}
		else if(selector_id == "setting-pane-budget-selector"){
			self.m_budget_controller.submit();
		}
		else if(selector_id == "setting-pane-account-selector"){
			// do nothing
		}
	});

	this.initViewSubpane();
}


kakeibo.controller.SettingTabController.prototype.submitViewSubpane = function(){
	var call_back = function(status, data){
		kakeibo.loading_screen.hide();

		if(status == "success"){
			jSuccess(
				$("#setting-pane-msg-setting-changed").html(),
				{
					autoHide : true,
					TimeShown : 3000,
					ShowOverlay : false,
					clickOverley : true,
					HorizontalPosition : 'center'
				}
			);
		}
		else{
			alert("setting/upload is failed!!");
		}
	};

	kakeibo.model.Setting.setValue("num-grid-row",    $("#setting-pane-select-num-grid-row").val());
	kakeibo.model.Setting.setValue("num-summary-col", $("#setting-pane-select-num-summary-col").val());
	kakeibo.model.Setting.upload(call_back);
	kakeibo.loading_screen.show();
}


kakeibo.controller.SettingTabController.prototype.initViewSubpane = function(){
	$("#setting-pane-select-num-grid-row").val(kakeibo.model.Setting.getValue("num-grid-row"));
	$("#setting-pane-select-num-summary-col").val(kakeibo.model.Setting.getValue("num-summary-col"));
}


kakeibo.controller.SettingTabController.prototype.onActivated = function(){
	this.m_subpane_controller.activate();
}
