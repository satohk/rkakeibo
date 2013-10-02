

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
		kakeibo.list_tab_controller = new kakeibo.controller.ListTabController();
		kakeibo.summary_tab_controller = new kakeibo.controller.SummaryTabController();
		kakeibo.setting_tab_controller = new kakeibo.controller.SettingTabController();

		kakeibo.main_tab_controller.addPane("navbar-list-pane-selector", function(){kakeibo.list_tab_controller.onActivated()});
		kakeibo.main_tab_controller.addPane("navbar-summary-pane-selector", function(){kakeibo.summary_tab_controller.onActivated()});
		kakeibo.main_tab_controller.addPane("navbar-setting-pane-selector", function(){kakeibo.setting_tab_controller.onActivated()});
		kakeibo.main_tab_controller.changePane("navbar-list-pane-selector");
	}
}

