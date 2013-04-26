

var kakeibo; //namespace

if(!kakeibo) kakeibo = {};

kakeibo.init = function(categories, settings){
	{ // init global variables
		kakeibo.model.Setting.init(settings);
		kakeibo.category_set = new kakeibo.model.CategorySet(categories);
		kakeibo.loading_screen = new kakeibo.component.LoadingScreen($(document.body));
		$.initCategoryPopover(kakeibo.category_set);
	}

	{ // init tabs
		kakeibo.main_tab_controller = new kakeibo.controller.TabController("li");
		// var main_controller = new kakeibo.controller.MainController(null);
		var list_tab_controller = new kakeibo.controller.ListTabController();
		var summary_tab_controller = new kakeibo.controller.SummaryTabController();
		var setting_tab_controller = new kakeibo.controller.SettingTabController();

		kakeibo.main_tab_controller.addPane("navbar-list-pane-selector", function(){list_tab_controller.onActivated()});
		kakeibo.main_tab_controller.addPane("navbar-summary-pane-selector", function(){summary_tab_controller.onActivated()});
		kakeibo.main_tab_controller.addPane("navbar-setting-pane-selector", function(){setting_tab_controller.onActivated()});
		kakeibo.main_tab_controller.changePane("navbar-list-pane-selector");
	}
}

