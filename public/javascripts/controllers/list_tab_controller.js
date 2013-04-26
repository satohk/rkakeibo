
var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.controller) kakeibo.controller = {};


/*
 * class ListTabController
 */
kakeibo.controller.ListTabController = function(){
	this.m_detail_panel_state = {
		state: "close",
		animation_ct: 0,
		animation_goal_ct: 100,
		animation_start_height:0,
		animation_goal_height: 0,
		animation_frame_rate: 30,
		timer_id: 0
	};

	this.m_view_dirty = false;
	this.m_all_entry_lists = [];

	this.initDetailPanel();
	this.initGrid();
	this.initKakeiboEntryLists();

	{ // init events
		var self = this;

		$(window).resize(function(){
			self.adjustGridSize();
		});

		kakeibo.model.Setting.addUpdateListener(function(key){
			if(key == "num-grid-row"){
				var val = kakeibo.model.Setting.getInt(key);
				self.m_grid.changeNumRow(val);
				for(var i = 0; i < self.m_all_entry_lists.length; i++){
					self.m_all_entry_lists[i].changePageSize(val);
				}
			}
		});

		setTimeout(function(){self.adjustGridSize();}, 10);
	}
}


kakeibo.controller.ListTabController.prototype.initKakeiboEntryLists = function(){
	var self = this;

	var on_current_page_modified = function(list){
		if(self.m_grid.getList() == list){
			self.updateView();
		}
	}

	var on_update_entry = function(entry){
		self.m_grid.updateEntry(entry);
	}

	this.m_selector2list = {};
	this.m_current_list_selector = null;

	var list = new kakeibo.model.KakeiboEntryList({}, kakeibo.model.Setting.getInt("num-grid-row"), on_current_page_modified);
	this.bindKakeiboEntryList2button("list-pane-all-entries-button", list);
	this.m_all_entry_lists.push(list);

	this.m_recent_entry_list = new kakeibo.model.KakeiboRecentEntryList(kakeibo.model.Setting.getInt("num-grid-row"), on_current_page_modified);
	this.bindKakeiboEntryList2button("list-pane-recent-entries-button", this.m_recent_entry_list);

	kakeibo.model.KakeiboEntrySet.setUpdateEntryListener(on_update_entry);

	setTimeout(function(){
		$("#list-pane-all-entries-button").click();
	}, 1);
}


kakeibo.controller.ListTabController.prototype.bindKakeiboEntryList2button = function(selector_button_id, list){
	var self = this;

	this.m_selector2list[selector_button_id] = list;

	$("#" + selector_button_id).click(function(e){
		var list = self.m_selector2list[e.target.id];
		if(self.m_grid.getList() != list){
			if(self.m_grid.getList() != null){
				$("#" + self.m_current_list_selector).parent().removeClass("active");
			}
			$("#" + e.target.id).parent().addClass("active");
			self.m_current_list_selector = e.target.id;
			self.m_grid.setList(list);
			self.updateView();
		}
	});
}


kakeibo.controller.ListTabController.prototype.initDetailPanel = function(){
	var self = this;

	$("#list-pane-detail-panel").hide();

	var next_tab_hash = {
		'list-pane-input-date' : 'list-pane-input-debtor',
		'list-pane-input-debtor' : 'list-pane-input-creditor',
		'list-pane-input-creditor' : 'list-pane-input-amount',
		'list-pane-input-amount' : 'list-pane-input-memo',
		'list-pane-input-memo' : 'list-pane-add-submit-button',
		'list-pane-add-submit-button' : 'list-pane-modify-submit-button',
		'list-pane-modify-submit-button' : 'list-pane-input-date'
	};

	var prev_tab_hash = {
		'list-pane-input-date' : 'list-pane-modify-submit-button',
		'list-pane-input-debtor' : 'list-pane-input-date',
		'list-pane-input-creditor' : 'list-pane-input-debtor',
		'list-pane-input-amount' : 'list-pane-input-creditor',
		'list-pane-input-memo' : 'list-pane-input-amount',
		'list-pane-add-submit-button' : 'list-pane-input-memo',
		'list-pane-modify-submit-button' : 'list-pane-add-submit-button',
	};

	var init_focus_loop = function($elem){
		$elem.focus(function(e){
			$(this).select();
		});
		$elem.keydown(function(e){
			if(e.keyCode == 13){ // Enter
				var id = e.target.id;
				while(true){
					var next_id = e.shiftKey ? prev_tab_hash[id] : next_tab_hash[id];
					var $next = $("#" + next_id);
					if(next_id == e.target.id){
						break;
					}
					if($next.css("display") != "none"){
						$next.focus();
						break;
					}
					id = next_id;
				}
				return false;
			}
		});
	};

	var init_blur_func = function($elem, input_val2obj_func, obj2str_func){
		$elem.blur(function(e){
			var obj = input_val2obj_func($(this).val());
			if(obj != null){
				$(this).val(obj2str_func(obj));
				$(this).parent().removeClass("error");
			}
			else{
				$(this).parent().addClass("error");
			}
		});
	};

	{ // date
		var $date = $("#list-pane-input-date");
		$date.val(kakeibo.model.KakeiboEntryAttrConverter.date2str(new Date()));
		$date.datepicker({
			beforeShow : function() {
				$('#ui-datepicker-div').css( 'font-size', '70%' );    // 全体のフォントを70%に縮小
			},
		});
		init_focus_loop($date);
		init_blur_func($date, kakeibo.model.KakeiboEntryAttrConverter.str2date, kakeibo.model.KakeiboEntryAttrConverter.date2str);
	}

	{ // debtor
		var $debtor = $("#list-pane-input-debtor");
		$debtor.categoryPopover();
		init_focus_loop($debtor);
		init_blur_func($debtor, kakeibo.model.KakeiboEntryAttrConverter.str2category, kakeibo.model.KakeiboEntryAttrConverter.category2str);
	}

	{ // creditor
		var $creditor = $("#list-pane-input-creditor");
		$creditor.categoryPopover();
		init_focus_loop($creditor);
		init_blur_func($creditor, kakeibo.model.KakeiboEntryAttrConverter.str2category, kakeibo.model.KakeiboEntryAttrConverter.category2str);
	}

	{ // amount
		var $amount = $("#list-pane-input-amount");
		init_focus_loop($amount);
		init_blur_func($amount, kakeibo.model.KakeiboEntryAttrConverter.str2amount, kakeibo.model.KakeiboEntryAttrConverter.amount2str);
	}

	{ // memo
		var $memo = $("#list-pane-input-memo");
		init_focus_loop($memo);
	}

	{ // close
		$("#list-pane-detail-panel-close-button").on('click', function(){
			self.switchDetailPanel("close");
		});
	}

	{ //add submit
		var $submit = $('#list-pane-add-submit-button');
		$submit.keydown(function(e){
			if(e.keyCode == 13 && !e.shiftKey){ // Enter
				$(e.target).click();
			}
		});
		init_focus_loop($submit);
		$submit.click(function(){
			var data = {
				amount: $("#list-pane-input-amount").val(),
				creditor_leaf_shortcut: $("#list-pane-input-creditor").val(),
				debtor_leaf_shortcut: $("#list-pane-input-debtor").val(),
				transaction_date: $("#list-pane-input-date").val(),
				memo: $("#list-pane-input-memo").val()
			};

			var entry = kakeibo.model.KakeiboEntrySet.addEntry(-1, data, true);
			if(entry == null){
				jError($("#list-pane-msg-input-error").attr("msg"), {clickOverlay: true});
				return;
			}

			self.m_recent_entry_list.addEntry(entry);

			$("#list-pane-recent-entries-button").click();
			self.m_recent_entry_list.moveToFirstPage();
			self.updateView();
		});
	}

	{ //modify submit
		var $mod = $('#list-pane-modify-submit-button');
		$mod.keydown(function(e){
			if(e.keyCode == 13 && !e.shiftKey){ // Enter
				$(e.target).click();
			}
		});
		init_focus_loop($mod);
		$mod.click(function(){
			var data = {
				amount: $("#list-pane-input-amount").val(),
				creditor_leaf_shortcut: $("#list-pane-input-creditor").val(),
				debtor_leaf_shortcut: $("#list-pane-input-debtor").val(),
				transaction_date: $("#list-pane-input-date").val(),
				memo: $("#list-pane-input-memo").val()
			};

			var entry = self.m_grid.getSelectedEntry()
			if(entry == null){
				jError("data select error", {clickOverlay: true});
				return;
			}

			if(kakeibo.model.KakeiboEntrySet.updateEntry(entry.getId(), entry.getId(), data, true) == null){
				jError($("#list-pane-msg-input-error").attr("msg"), {clickOverlay: true});
				return;
			}
			self.m_grid.unselectRow();
		});
	}
}


kakeibo.controller.ListTabController.prototype.initGrid = function(){
	var self = this;

	$("#list-pane-add-button").click(function(){
		self.switchDetailPanel("add");
		self.m_grid.unselectRow();
		//$("#list-pane-input-date").focus();
	});

	$("#list-pane-remove-button").click(function(){
		var id_list = self.m_grid.getCheckedEntryIdList();

		if(id_list.length > 0){
			var msg = $("#list-pane-msg-remove").attr("msg").replace("%d", id_list.length);
			var ret = confirm(msg);
			if(ret == true){
				self.m_grid.unselectRow();
				self.m_grid.clearAllCheckbox();
				kakeibo.model.KakeiboEntrySet.removeEntries(id_list);
			}
		}
	});

	$("#list-pane-prev-page-button").click(function(){
		if(self.m_grid.getList().moveCurrentPage(-1)){
			self.updateView();
			self.m_grid.clearAllCheckbox();
			self.m_grid.unselectRow();
		}
	});
	$("#list-pane-next-page-button").click(function(){
		if(self.m_grid.getList().moveCurrentPage(1)){
			self.updateView();
			self.m_grid.clearAllCheckbox();
			self.m_grid.unselectRow();
		}
	});

	var on_change_selection = function(row_no){
		if(row_no != -1){
			var entry = self.m_grid.getList().getEntryInCurrentPage(row_no);
			self.setEntryToDetailPanel(entry);
			self.switchDetailPanel("modify");
		}
		else{
			if(self.m_detail_panel_state.state == "modify"){
				self.switchDetailPanel("add");
			}
		}
	};

	this.m_grid = new kakeibo.component.Grid({
		caption_date: $("#list-pane-input-date-caption").html(),
		caption_debtor: $("#list-pane-input-debtor-caption").html(),
		caption_creditor: $("#list-pane-input-creditor-caption").html(),
		caption_amount: $("#list-pane-input-amount-caption").html(),
		caption_memo: $("#list-pane-input-memo-caption").html(),
		num_row: kakeibo.model.Setting.getInt("num-grid-row"),
		container: "list-pane-grid-wrapper",
		on_change_selection: on_change_selection
	});
}

kakeibo.controller.ListTabController.prototype.setEntryToDetailPanel = function(entry){
	$("#list-pane-input-amount").val(entry.getAmountStr()).blur();
	$("#list-pane-input-creditor").val(entry.getCreditorLeafStr()).blur();
	$("#list-pane-input-debtor").val(entry.getDebtorLeafStr()).blur();
	$("#list-pane-input-date").val(entry.getTransactionDateStr()).blur();
	$("#list-pane-input-memo").val(entry.getMemoStr()).blur();
}

kakeibo.controller.ListTabController.prototype.updateView = function(){
	if($("#list-pane:hidden").length != 0){
		this.m_view_dirty = true;
		return;
	}
	this.m_view_dirty = false;

	this.m_grid.update();

	var list = this.m_grid.getList();
	var all = list.getNumEntries();

	if(all == 0 || all == -1){
		$("#list-pane-grid-info-str").html("");
	}
	else{
		var page_start = list.getCurrentPageNo() * list.getPageSize() + 1;
		var page_end = Math.min(all, (list.getCurrentPageNo() + 1) * list.getPageSize());
		$("#list-pane-grid-info-str").html("" + page_start + "-" + page_end + " of " + all);
	}
}


kakeibo.controller.ListTabController.prototype.switchDetailPanel = function(next_state){
	var detail_panel = $('#list-pane-detail-panel');
	var state = this.m_detail_panel_state;

	if(next_state != "add" && next_state != "modify"  && next_state != "close"){
		return;
	}
	if(state.state == next_state){
		return;
	}

	var current_state = state.state;

	state.state = next_state
	state.animation_ct = 0;
	state.animation_goal_ct = 1;
	state.animation_frame_rate = 15;

	if(next_state == "add"){
		$("#list-pane-modify-submit-button").hide();
		$("#list-pane-add-submit-button").show();
	}
	else if(next_state == "modify"){
		$("#list-pane-modify-submit-button").show();
		$("#list-pane-add-submit-button").hide();
	}

	if(next_state == "close" || current_state == "close"){
		if(next_state != "close"){
			detail_panel.show();
			state.animation_start_height = 0;
			state.animation_goal_height = $("#list-pane-detail-panel-content").height();
		}
		else{
			state.animation_start_height = detail_panel.height();
			state.animation_goal_height = 0;
		}

		var self = this;
		state.timer_id = setInterval(function() {self.onAnimateDetailPanel()}, state.animation_frame_rate);
	}
}


kakeibo.controller.ListTabController.prototype.onAnimateDetailPanel = function(){
	var panel = $('#list-pane-detail-panel');
	var state = this.m_detail_panel_state;
	var panel_height;

	state.animation_ct++;

	panel_height = state.animation_start_height +
		(1 - Math.cos(Math.PI * state.animation_ct / state.animation_goal_ct)) / 2 *
		(state.animation_goal_height - state.animation_start_height);

	panel.height(parseInt(panel_height), 10);

	if(state.animation_ct >= state.animation_goal_ct){
		clearInterval(state.timer_id);
		if(state.state == "close"){
			panel.hide();
		}
	}

	this.adjustGridSize();
}


kakeibo.controller.ListTabController.prototype.adjustGridSize = function(){
	if($("#list-pane:hidden").length != 0){
		return;
	}

	var MARGIN = 20 + 40;
	var window_height = $(window).height();
	var grid = $('#list-pane-grid-wrapper');
	var grid_top = grid.offset().top;
	grid.height(window_height - grid_top - MARGIN);
}


kakeibo.controller.ListTabController.prototype.onActivated = function(){
	if(this.m_view_dirty){
		this.updateView();
	}
	this.adjustGridSize();
}
