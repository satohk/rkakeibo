
var kakeibo; //namespace

if(!kakeibo) kakeibo = {};
if(!kakeibo.component) kakeibo.component = {};


kakeibo.component.Grid = function(params){
	this.m_params = {
		caption_date: "date",
		caption_debtor: "debtor",
		caption_creditor: "creditor",
		caption_amount: "amount",
		caption_memo: "memo",
		num_row: 15,
		container: "",
		list: null,
		on_change_selection: function(){}
	};
	for(key in params){
		this.m_params[key] = params[key];
	}

	this.m_params = params;
	this.m_selected_row_no = -1;
	this.m_visible_row_ct = 0;

	this.initView();
}


kakeibo.component.Grid.prototype.initView = function(){
	var header =
		'<table id="grid" class="table table-striped grid-content">' +
		'<thead>' +
		'  <tr>' +
		'    <th class="text-info" width="30"></th>' +
		'    <th class="text-info" width="100">' + this.m_params.caption_date + '</th>' +
		'    <th class="text-info" width="100">' + this.m_params.caption_debtor + '</th>' +
		'    <th class="text-info" width="100">' + this.m_params.caption_creditor + '</th>' +
		'    <th class="text-info" width="80">'  + this.m_params.caption_amount + '</th>' +
		'    <th class="text-info">' + this.m_params.caption_memo + '</th>' +
		'  </tr>' +
		'</thead>' +
		'<tbody id="grid-tbody">';

	var row =
		'  <tr class="grid-row" style="display:none">' +
		'    <td width="30"> <input type="checkbox"></input><img src="/img/loading.gif"></td>' +
		'    <td width="100"> </td>' +
		'    <td width="100"> </td>' +
		'    <td width="100"> </td>' +
		'    <td width="80"> </td>' +
		'    <td> </td>' +
		'  </tr>';

	var footer =
		'</tbody>' +
		'</table>' +
		'<div id="grid-footer" class="grid-footer" style="display:none">' +
		'  <img id="grid-footer-loading-img" src="/img/loading_big.gif">' +
		'  <strong id="grid-footer-msg">no data</strong>' +
		'</div>';

	var content = header;
	for(var i = 0; i < this.m_params.num_row; i++){
		content += row;
	}
	content += footer;
	$("#" + this.m_params.container).html(content);

	var self = this;
	var on_click = function(e){
		if(e.target.nodeName.toUpperCase() == "INPUT"){
			return;
		}
		var $target = $(e.target);
		var row_no = parseInt($target.closest("tr").attr("row_no"));

		var entry = self.m_params.list.getEntryInCurrentPage(row_no);
		if(!entry.isUploading()){
			self.m_selected_row_no = row_no;
			self.m_params.on_change_selection(row_no);
			self.update();
		}
	}

	var $tbody = $("#grid-tbody");
	var $rows = $tbody.children();
	for(i = 0; i < $rows.length; i++){
		$row = $($rows[i]);
		$row.attr("row_no", i);
		$row.click(on_click);
	}
}


kakeibo.component.Grid.prototype.update = function(){
	var $tbody = $("#grid-tbody");
	var $rows = $tbody.children("tr");
	var list = this.m_params.list;

	// update rows
	this.m_visible_row_ct = 0;
	for(var i = 0; i < $rows.length; i++){
		var entry = list.getEntryInCurrentPage(i);
		this.setEntryToGridRow(i, $($rows[i]), entry);
		if(entry != null){
			this.m_visible_row_ct++;
		}
	}

	{ // update footer
		var page_start, page_end, all;
		all = list.getNumEntries();
		page_start = list.getCurrentPageNo() * list.getPageSize() + 1;
		page_end = Math.min(all, (list.getCurrentPageNo() + 1) * list.getPageSize());
		if(all == -1 || this.m_visible_row_ct < page_end - page_start + 1){
			$("#grid-footer").show();
			$("#grid-footer-loading-img").show();
			$("#grid-footer-msg").html("");
		}
		else if(all == 0){
			$("#grid-footer").show();
			$("#grid-footer-loading-img").hide();
			$("#grid-footer-msg").html("no data");
		}
		else{
			$("#grid-footer").hide();
		}
	}
}


kakeibo.component.Grid.prototype.updateEntry = function(entry){
	var list = this.m_params.list;
	for(var i = 0; i < list.getPageSize(); i++){
		var row_e = list.getEntryInCurrentPage(i);
		if(row_e != null && row_e == entry){
			this.setEntryToGridRow(i, $($("#grid-tbody").children("tr")[i]), entry)
		}
	}
}


kakeibo.component.Grid.prototype.setEntryToGridRow = function(row_ct, $row, entry){
	var $td = $row.children();

	if(entry != null){
		var creditor = "";
		var debtor = "";

		if(entry.getCreditorSub() != null){
			creditor += entry.getCreditorSub().getName() + "<br>";
		}
		if(entry.getCreditor() != null){
			creditor += "<div class='muted'>" + entry.getCreditor().getName() + "<div>";
		}
		else{
			creditor += "<div class='muted'>-<div>";
		}
		if(entry.getDebtorSub() != null){
			debtor += entry.getDebtorSub().getName() + "<br>";
		}
		if(entry.getDebtor() != null){
			debtor += "<div class='muted'>" + entry.getDebtor().getName() + "</div>";
		}
		else{
			debtor += "<div class='muted'>-<div>";
		}

		if(entry.isUploading()){
			$($td[0]).children("img").show();
			$($td[0]).children("input").hide();
		}
		else{
			$($td[0]).children("img").hide();
			$($td[0]).children("input").show();
		}
		$td[1].innerHTML = entry.getTransactionDateStr();
		$td[2].innerHTML = debtor;
		$td[3].innerHTML = creditor;
		var amount_color;
		if(entry.getCreditor().isCreditor()){
			amount_color = "text-success";
		}
		else{
			amount_color = "text-error";
		}
		$td[4].innerHTML = "<div class='pull-right " + amount_color + "'><strong>" + entry.getAmountStr() + "&nbsp;&nbsp;&nbsp;</strong></div>";
		$($td[5]).text(entry.getMemoStr());

		if(row_ct == this.m_selected_row_no){
			$row.addClass("info");
		}
		else{
			$row.removeClass("info");
		}

		$row.show();
	}
	else{
		$row.hide();
	}
}


kakeibo.component.Grid.prototype.clearAllCheckbox = function(){
	var $tbody = $("#grid-tbody");
	$tbody.children("tr").children("td").children("input").attr("checked", false);
}


kakeibo.component.Grid.prototype.setList = function(list){
	this.m_params.list = list;
	this.clearAllCheckbox();
	this.unselectRow();
}


kakeibo.component.Grid.prototype.getList = function(){
	return this.m_params.list;
}


kakeibo.component.Grid.prototype.getCheckedEntryIdList = function(){
	var $tbody = $("#grid-tbody");
	var $rows = $tbody.children("tr");
	var list = this.m_params.list;
	var id_list = [];

	for(var i = 0; i < $rows.length; i++){
		var $row = $($rows[i]);
		var $input = $row.children("td").children("input");
		if($input.attr("checked")){
			var entry = list.getEntryInCurrentPage(i);
			id_list.push(entry.getId());
		}
	}

	return id_list;
}


kakeibo.component.Grid.prototype.getSelectedEntry = function(){
	if(this.m_selected_row_no == -1){
		return null;
	}
	else{
		return this.m_params.list.getEntryInCurrentPage(this.m_selected_row_no);
	}
}


kakeibo.component.Grid.prototype.unselectRow = function(){
	if(this.m_selected_row_no != -1){
		var old = this.m_selected_row_no;
		this.m_selected_row_no = -1;

		var list = this.m_params.list;
		var entry = list.getEntryInCurrentPage(old);
		if(entry != null){
			this.setEntryToGridRow(old, $($("#grid-tbody").children("tr")[old]), entry)
		}

		this.m_params.on_change_selection(-1);
	}
}


kakeibo.component.Grid.prototype.changeNumRow = function(num_row){
	this.m_params.num_row = num_row;

	this.initView();
}
