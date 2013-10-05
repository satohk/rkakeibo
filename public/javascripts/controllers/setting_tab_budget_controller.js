
var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.controller) kakeibo.controller = {};


kakeibo.controller.SettingTabBudgetController = function(){
	this.m_summary_page_size = 2;
	this.m_view_dirty = false;

	this.initView();

	var self = this;

	var refresh_func = function(){
		$input = $("#setting-pane-budget-date-input");
		token = $input.val().split("/");
		
		for(var i = 0; i < token.length; i++){
			if(!token[i].match( /^[0-9]+$/ )){
				return;
			}
			token[i] = parseInt(token[i]);
		}
		if(token.length == 2){
			self.setDate({year:token[0], month:token[1]});
		}
	}

	$("#setting-pane-budget-date-refresh-button").click(function(e){
		refresh_func();
	});

	$("#setting-pane-budget-date-input").keydown(function(e){
		if(e.keyCode == 13){ // Enter
			refresh_func();
			return false;
		}
	});

	$("#setting-pane-budget-copy").click(function(e){
		self.updateView(true);
	});

	kakeibo.model.SummaryTable.addModifyTableListener(function(target){
		self.updateView();
	});

	var now = new Date();
	self.setDate({year:now.getFullYear(), month:now.getMonth() + 1});
}


kakeibo.controller.SettingTabBudgetController.prototype.initView = function(){
	var $template = $("#setting-pane-budget-row-template");

	var root = kakeibo.category_set.getRoot();
	for(i = 0; i < root.getNumChildren(); i++){
		var category = root.getChild(i);

		if(category.getCategoryType() == kakeibo.model.CategoryType.COST){
			var copy = $template.clone();
			copy.show();
			copy.attr("category-id", category.getId());
			copy.children("td")[0].innerHTML = category.getName();
			$template.before(copy);
		}
	}
}


kakeibo.controller.SettingTabBudgetController.prototype.setDate = function(date){
	if(kakeibo.utils.isValidDate(date) && date.month != 0){
		this.m_date = date;
		$("#setting-pane-budget-date-input").val("" + date.year + "/" + date.month);

		var before_date = kakeibo.utils.calcSummaryColDate(date, -1);
		var $thead = $("#setting-pane-budget-thead");
		var $th2 = $thead.children("tr").children("th:nth-child(2)");
		var $th3 = $thead.children("tr").children("th:nth-child(3)");
		var $th4 = $thead.children("tr").children("th:nth-child(4)");
		$th2.html($th2.attr("template").replace("%y", before_date.year).replace("%m", before_date.month));
		$th3.html($th3.attr("template").replace("%y", before_date.year).replace("%m", before_date.month));
		$th4.html($th4.attr("template").replace("%y", date.year).replace("%m", date.month));

		this.updateView();
	}
}


kakeibo.controller.SettingTabBudgetController.prototype.updateView = function(copy_before_col){
	if($("#setting-pane-budget:hidden").length != 0){
		this.m_view_dirty = true;
		return;
	}
	this.m_view_dirty = false;

	var downloading = false;
	var before_date = kakeibo.utils.calcSummaryColDate(this.m_date, -(this.m_summary_page_size - 1));
	downloading = !kakeibo.model.SummaryTable.setPage(before_date.year, before_date.month, this.m_summary_page_size);

	var $tbody = $("#setting-pane-budget-tbody");
	var $tr_list = $tbody.children("tr");
	for(var i = 0; i < $tr_list.length; i++){
		var $tr = $($tr_list[i])
		var category_id = $tr.attr("category-id");
		if(typeof category_id === "undefined"){
			continue;
		}
		var $td_list = $tr.children();

		var before_summary = kakeibo.model.SummaryTable.getCell(before_date.year, before_date.month, category_id);
		if(before_summary != null){
			var budget = kakeibo.utils.addFigure(before_summary.getBudget());
			var sum = kakeibo.utils.addFigure(before_summary.getSumAmount());
			var color = sum <= budget ? "text-success" : "text-error";
			$td_list[1].innerHTML = '<div class="pull-right">' + budget + '</div>';
			$td_list[2].innerHTML = '<div class="pull-right ' + color + '">' + sum + '</div>';
		}
		
		if(before_summary != null && copy_before_col){
			$($($td_list[3]).children("input")).val(kakeibo.utils.addFigure(before_summary.getBudget()));
		}
		else{
			var summary = kakeibo.model.SummaryTable.getCell(this.m_date.year, this.m_date.month, category_id);
			if(summary != null){
				$($($td_list[3]).children("input")).val(kakeibo.utils.addFigure(summary.getBudget()));
			}
		}
	}
	
	if(downloading){
		$("#setting-pane-budget-loading-img").show();
	}
	else{
		$("#setting-pane-budget-loading-img").hide();
	}
}


kakeibo.controller.SettingTabBudgetController.prototype.submit = function(){
	var $tbody = $("#setting-pane-budget-tbody");
	var $tr_list = $tbody.children("tr");
	var budget_hash = {};
	for(var i = 0; i < $tr_list.length; i++){
		var $tr = $($tr_list[i])
		var $input = $tr.children("td:nth-child(4)").children("input");
		var category_id = $tr.attr("category-id");
		if(typeof category_id === "undefined"){
			continue;
		}
		var amount = kakeibo.model.KakeiboEntryAttrConverter.str2amount($input.val());
		if(amount != null){
			budget_hash[parseInt(category_id)] = amount;
		}
		else{
			jError($("#setting-pane-msg-input-error").attr("msg"), {clickOverlay: true});
			return;
		}
	}

	var call_back = function(status, data){
		kakeibo.loading_screen.hide();

		if(status == "success"){
			jSuccess($("#setting-pane-msg-budget-success-update").html(),
					 {
						 autoHide : true,
						 TimeShown : 3000,
						 ShowOverlay : false,
						 clickOverley : true,
						 HorizontalPosition : 'center'
					 });
		}
		else{
			alert("kakeibo/update_budget is failed!!");
		}
	};

	kakeibo.model.SummaryTable.updateBudget(this.m_date.year, this.m_date.month, budget_hash, call_back);
	this.updateView();
	kakeibo.loading_screen.show();
}


kakeibo.controller.SettingTabBudgetController.prototype.cancel = function(){
	this.updateView();
}


kakeibo.controller.SettingTabBudgetController.prototype.onActivated = function(){
	if(this.m_view_dirty){
		this.updateView();
	}
}
