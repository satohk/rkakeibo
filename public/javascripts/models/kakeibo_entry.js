
if(!kakeibo.model){
	kakeibo.model = {}; // namespace
}


/*
 * class KakeiboEntryList
 */
kakeibo.model.KakeiboEntryList = function(query_option, page_size, on_current_page_modified){
	this.m_entries = [];
	this.m_num_entries = -1;
	this.m_page_size = page_size;
	this.m_current_page_no = 0;
	this.m_query_option = query_option;
	this.m_on_current_page_modified = on_current_page_modified;

	kakeibo.model.KakeiboEntryList.m_all_lists.push(this);
}

kakeibo.model.KakeiboEntryList.prototype.refresh = function(){
	this.m_entries = [];
	this.m_num_entries = -1;
	this.m_current_page_no = 0;
	if(this.m_on_current_page_modified){
		this.m_on_current_page_modified(this);
	}
}

kakeibo.model.KakeiboEntryList.prototype.getPageSize = function(){
	return this.m_page_size;
}

kakeibo.model.KakeiboEntryList.prototype.changePageSize = function(page_size){
	this.m_page_size = page_size;
	this.m_current_page_no = 0;
	if(this.m_on_current_page_modified){
		this.m_on_current_page_modified(this);
	}
}

kakeibo.model.KakeiboEntryList.prototype.getEntryInCurrentPage = function(offset){
	var i = this.m_current_page_no * this.m_page_size + offset;

	if(this.m_num_entries == -1 && this.m_entries[0] == undefined){
		this.requestEntries(0, this.m_page_size);
		return null;
	}
	else if(i >= this.m_num_entries){
		return null;
	}
	else if(typeof this.m_entries[i] === "undefined"){
		this.requestEntries(i, this.m_page_size);
		return null;
	}
	else if(this.m_entries[i] == kakeibo.model.KakeiboEntryList.downloading_entry){
		return null;
	}
	else{
		return this.m_entries[i];
	}
}

kakeibo.model.KakeiboEntryList.prototype.removeEntries = function(id_list){
	var num_removed_entries = 0;

	for(var i = 0; i < id_list.length; i++){
		var id = id_list[i];

		for(var j = 0; j < this.m_entries.length; j++){
			var entry = this.m_entries[j];
			if(entry == undefined || entry == kakeibo.model.KakeiboEntryList.downloading_entry){
				continue;
			}
			if(entry.getId() == id){
				this.m_entries.splice(j, 1);
				num_removed_entries++;
				break;
			}
		}
	}

	this.m_num_entries -= num_removed_entries;

	if(this.m_on_current_page_modified){
		this.m_on_current_page_modified(this);
	}
}

kakeibo.model.KakeiboEntryList.prototype.getCurrentPageNo = function(){
	return this.m_current_page_no;
}

kakeibo.model.KakeiboEntryList.prototype.moveCurrentPage = function(move_num){
	var new_page = this.m_current_page_no + move_num;

	if(new_page < 0){
		new_page = 0;
	}
	else if(new_page >= this.getNumPages()){
		new_page = this.getNumPages() - 1;
	}

	if(this.m_current_page_no != new_page){
		this.m_current_page_no = new_page;
		return true;
	}
	else{
		return false;
	}
}

kakeibo.model.KakeiboEntryList.prototype.moveToFirstPage = function(){
	this.moveCurrentPage(-this.m_current_page_no);
}


kakeibo.model.KakeiboEntryList.prototype.getNumPages = function(){
	if(this.m_num_entries == -1){
		return 1;
	}
	else if(this.m_num_entries == 0){
		return 1;
	}
	else{
		return Math.ceil(this.m_num_entries / this.m_page_size)
	}
}

kakeibo.model.KakeiboEntryList.prototype.getNumEntries = function(){
	return this.m_num_entries;
}

kakeibo.model.KakeiboEntryList.prototype.requestEntries = function(offset, limit){
	var self = this;

	console.log("offset:" + offset + "  limit:" + limit);
	console.log(this.m_query_option.getArray());

	var param = {
		offset: offset,
		limit: limit,
		req_all_ct: (offset == 0) ? 1 : 0,
		option: this.m_query_option.getArray()
	};
	var call_back = function(status, data){
		console.log("kakeibo_entry call_back====================================");
		console.log(status);
		console.log(data);
		if(status == "success"){
			var i;

			console.log(data);

			for(i = 0; i < data.limit; i++){
				self.m_entries[i + data.offset] = kakeibo.model.KakeiboEntrySet.addEntry(parseInt(data.rows[i].id, 10), data.rows[i], false)
			}

			if(data.all_ct != null && data.all_ct != undefined){
				self.m_num_entries = data.all_ct;
			}

			{
				var s1, e1, s2, e2;
				s1 = data.offset;
				e1 = s1 + data.limit - 1;
				s2 = self.m_current_page_no * self.m_page_size;
				e2 = s2 + self.m_page_size - 1;
				if((s1 <= e2 && s2 <= e2) || data.limit == 0){
				   if(self.m_on_current_page_modified){
					   self.m_on_current_page_modified(self);
				   }
				}
			}
		}
		else{
			alert("kakeibo/get_entries/1 is failed!!");
		}
	};
	kakeibo.model.RequestQueue.pushRequest("POST", "kakeibo/get_entries", param, call_back)

	for(var i = offset; i < offset + limit; i++){
		this.m_entries[i] = kakeibo.model.KakeiboEntryList.downloading_entry;
	}
}

kakeibo.model.KakeiboEntryList.downloading_entry = {};
kakeibo.model.KakeiboEntryList.m_all_lists = [];



/*
 * class KakeiboRecentEntryList
 */
kakeibo.model.KakeiboRecentEntryList = function(page_size, on_current_page_modified){
	kakeibo.model.KakeiboEntryList.apply(this, ["", page_size, on_current_page_modified]);
	this.m_num_entries = 0;
}

kakeibo.model.KakeiboRecentEntryList.prototype
	= Object.create(kakeibo.model.KakeiboEntryList.prototype);

kakeibo.model.KakeiboRecentEntryList.prototype.addEntry = function(entry){
	this.m_entries.unshift(entry);
	this.m_num_entries++;

	return entry;
}

kakeibo.model.KakeiboRecentEntryList.prototype.requestEntries = function(offset, limit){
	// do nothing
}

kakeibo.model.KakeiboRecentEntryList.prototype.refresh = function(offset, limit){
	// do nothing
}

/*
 * class KakeiboEntry
 */
kakeibo.model.KakeiboEntry = function(id, attr, uploading){
	this.m_id = id;
	this.m_uploading = uploading;
	this.setAttrHash(attr);
}

kakeibo.model.KakeiboEntry.prototype.getId = function(){
	return this.m_id;
}

kakeibo.model.KakeiboEntry.prototype.isUploading = function(){
	return this.m_uploading;
}

kakeibo.model.KakeiboEntry.prototype.getAmount = function(){
	return this.m_amount;
}

kakeibo.model.KakeiboEntry.prototype.getAmountStr = function(){
	return kakeibo.model.KakeiboEntryAttrConverter.amount2str(this.m_amount);
}

kakeibo.model.KakeiboEntry.prototype.getCreditor = function(){
	return this.m_creditor;
}

kakeibo.model.KakeiboEntry.prototype.getCreditorSub = function(){
	return this.m_creditor_sub;
}

kakeibo.model.KakeiboEntry.prototype.getDebtor = function(){
	return this.m_debtor;
}

kakeibo.model.KakeiboEntry.prototype.getDebtorSub = function(){
	return this.m_debtor_sub;
}

kakeibo.model.KakeiboEntry.prototype.getTransactionDate = function(){
	return this.m_transaction_date;
}

kakeibo.model.KakeiboEntry.prototype.getTransactionDateStr = function(){
	return kakeibo.model.KakeiboEntryAttrConverter.date2str(this.m_transaction_date);
}

kakeibo.model.KakeiboEntry.prototype.getMemo = function(){
	return this.m_memo;
}

kakeibo.model.KakeiboEntry.prototype.getMemoStr = function(){
	if(this.m_memo == null || this.m_memo == undefined){
		return "";
	}
	else{
		return this.m_memo;
	}
}

kakeibo.model.KakeiboEntry.prototype.getCreditorLeaf = function(){
	if(this.m_creditor_sub){
		return this.m_creditor_sub;
	}
	else{
		return this.m_creditor;
	}
}

kakeibo.model.KakeiboEntry.prototype.getCreditorLeafStr = function(){
	return kakeibo.model.KakeiboEntryAttrConverter.category2str(this.getCreditorLeaf());
}

kakeibo.model.KakeiboEntry.prototype.getDebtorLeaf = function(){
	if(this.m_debtor_sub){
		return this.m_debtor_sub;
	}
	else{
		return this.m_debtor;
	}
}

kakeibo.model.KakeiboEntry.prototype.getDebtorLeafStr = function(){
	return kakeibo.model.KakeiboEntryAttrConverter.category2str(this.getDebtorLeaf());
}

kakeibo.model.KakeiboEntry.prototype.isIncomplete = function(){
	if(!this.m_creditor || !this.m_debtor || !this.m_transaction_date || (this.m_amount==null || this.m_amount==undefined)){
		return true;
	}
	return false;
}

kakeibo.model.KakeiboEntry.prototype.setAttrHash = function(attr){
	for(var key in attr){
		if(key == "amount"){
			this.m_amount = kakeibo.model.KakeiboEntryAttrConverter.str2amount(String(attr[key]));
		}
		else if(key == "creditor_id"){
			this.m_creditor = kakeibo.category_set.getById(attr[key]);
		}
		else if(key == "creditor_sub_id"){
			this.m_creditor_sub = kakeibo.category_set.getById(attr[key]);
		}
		else if(key == "debtor_id"){
			this.m_debtor = kakeibo.category_set.getById(attr[key]);
		}
		else if(key == "debtor_sub_id"){
			this.m_debtor_sub = kakeibo.category_set.getById(attr[key]);
		}
		else if(key == "transaction_date"){
			this.m_transaction_date = kakeibo.model.KakeiboEntryAttrConverter.str2date(String(attr[key]));
		}
		else if(key == "memo"){
			this.m_memo = attr[key];
		}
		else if(key == "debtor_leaf_shortcut"){
			var c = kakeibo.model.KakeiboEntryAttrConverter.str2category(String(attr[key]));
			if(c != null){
				this.m_debtor = c.getParent();
				this.m_debtor_sub = c;
			}
			else{
				this.m_debtor = null;
				this.m_debtor_sub = null;
			}
		}
		else if(key == "creditor_leaf_shortcut"){
			var c = kakeibo.model.KakeiboEntryAttrConverter.str2category(String(attr[key]));
			if(c != null){
				this.m_creditor = c.getParent();
				this.m_creditor_sub = c;
			}
			else{
				this.m_creditor = null;
				this.m_creditor_sub = null;
			}
		}
	}
}

kakeibo.model.KakeiboEntry.prototype.getAttrHash = function(){
	var attr = {};

	if(this.m_transaction_date != null){
		attr.transaction_date = kakeibo.model.KakeiboEntryAttrConverter.date2str(this.m_transaction_date);
	}
	if(this.m_creditor != null){
		attr.creditor_id = this.m_creditor.getId();
	}
	if(this.m_creditor_sub != null){
		attr.creditor_sub_id = this.m_creditor_sub.getId();
	}
	else{
		attr.creditor_sub_id = -1;
	}
	if(this.m_debtor != null){
		attr.debtor_id = this.m_debtor.getId();
	}
	if(this.m_debtor_sub != null){
		attr.debtor_sub_id = this.m_debtor_sub.getId();
	}
	else{
		attr.debtor_sub_id = -1;
	}
	if(this.m_amount != null){
		attr.amount = this.m_amount;
	}
	if(this.m_memo != null){
		attr.memo = this.m_memo;
	}

	return attr;
}


/*
 * KakeiboEntrySearchParam
 */
kakeibo.model.KakeiboEntrySearchParam = function(param){
	this.m_param = [];

	var start_date = kakeibo.model.KakeiboEntryAttrConverter.str2date(param.start_date);
	if(start_date != null){
		this.m_param.push(["transaction_date", ">=", kakeibo.model.KakeiboEntryAttrConverter.date2str(start_date)]);
	}

	var end_date = kakeibo.model.KakeiboEntryAttrConverter.str2date(param.end_date);
	if(end_date != null){
		this.m_param.push(["transaction_date", "<=", kakeibo.model.KakeiboEntryAttrConverter.date2str(end_date)]);
	}

	var end_date_under = kakeibo.model.KakeiboEntryAttrConverter.str2date(param.end_date_under);
	if(end_date_under != null){
		this.m_param.push(["transaction_date", "<", kakeibo.model.KakeiboEntryAttrConverter.date2str(end_date_under)]);
	}

	var debtor = kakeibo.model.KakeiboEntryAttrConverter.str2category(param.debtor);
	if(debtor != null){
		if(debtor.getNumChildren() == 0){
			this.m_param.push(["debtor_sub_id", "=", debtor.getId()]);
		}
		else{
			this.m_param.push(["debtor_id", "=", debtor.getId()]);
		}
	}

	var creditor = kakeibo.model.KakeiboEntryAttrConverter.str2category(param.creditor);
	if(creditor != null){
		if(creditor.getNumChildren() == 0){
			this.m_param.push(["creditor_sub_id", "=", creditor.getId()]);
		}
		else{
			this.m_param.push(["creditor_id", "=", creditor.getId()]);
		}
	}

	var category_id = param.category_id;
	if(category_id != null){
		if(kakeibo.category_set.getById(category_id).getNumChildren() == 0){
			this.m_param.push(["category_sub_id", "=", category_id]);
		}
		else{
			this.m_param.push(["category_id", "=", category_id]);
		}
	}

	var amount_low = kakeibo.model.KakeiboEntryAttrConverter.str2amount(param.amount_low);
	if(amount_low != null){
		this.m_param.push(["amount", ">=", amount_low]);
	}

	var amount_high = kakeibo.model.KakeiboEntryAttrConverter.str2amount(param.amount_high);
	if(amount_high != null){
		this.m_param.push(["amount", "<=", amount_high]);
	}

	if(param.memo != null && param.memo != ""){
		this.m_param.push(["memo", "like", '%' + param.memo + '%']);
	}
}


kakeibo.model.KakeiboEntrySearchParam.prototype.getArray = function(){
	return this.m_param;
}


/*
 * KakeiboEntrySet (singleton class)
 */
kakeibo.model.KakeiboEntrySet = {};
kakeibo.model.KakeiboEntrySet.m_all_entries_hash = {};
kakeibo.model.KakeiboEntrySet.m_on_update_entry = null;
kakeibo.model.KakeiboEntrySet.m_temp_id_ct = -1;

kakeibo.model.KakeiboEntrySet.addEntry = function(id, attr, upload){
	if(id == -1){
		id = this.m_temp_id_ct;
		this.m_temp_id_ct--;
	}
	var entry = this.m_all_entries_hash[id];
	if(entry != null && entry != undefined){
		return entry;
	}
	else{
		entry = new kakeibo.model.KakeiboEntry(id, attr, upload);
		if(entry.isIncomplete()){
			return null;
		}
		this.m_all_entries_hash[id] = entry;
	}

	if(upload){
		var send_data = entry.getAttrHash();
		send_data.temp_id = entry.getId();

		kakeibo.model.RequestQueue.pushRequest("POST", "kakeibo/add", send_data, function(status, data) {
			if(status == "success"){
				kakeibo.model.KakeiboEntrySet.updateEntry(data.temp_id, data.new_id, null, false);
				kakeibo.model.SummaryTable.refresh();
			}
			else{
				alert("upload error!");
			}
		});

		for(var i = 0; i < kakeibo.model.KakeiboEntryList.m_all_lists.length; i++){
			kakeibo.model.KakeiboEntryList.m_all_lists[i].refresh();
		}
	}

	
	return entry;
}

kakeibo.model.KakeiboEntrySet.removeEntries = function(id_list){
	for(var i = 0; i < id_list.length; i++){
		var id = id_list[i];
		var entry = this.m_all_entries_hash[id];

		if(entry == null || entry == undefined){
			return false;
		}

		delete this.m_all_entries_hash[id];
	}

	var send_data = {
		"id_list": id_list
	};
	kakeibo.model.RequestQueue.pushRequest("POST", "kakeibo/remove", send_data, function(status, data) {
		if(status == "success"){
			kakeibo.model.SummaryTable.refresh();
		}
		else{
			alert("remove error!");
		}
	});
	
	for(var i = 0; i < kakeibo.model.KakeiboEntryList.m_all_lists.length; i++){
		kakeibo.model.KakeiboEntryList.m_all_lists[i].removeEntries(id_list);
	}
}

kakeibo.model.KakeiboEntrySet.updateEntry = function(id, new_id, attr, uploading){
	if(attr != null){ // check attr
		var temp = new kakeibo.model.KakeiboEntry(-1, attr, false);
		if(temp.isIncomplete()){
			return null;
		}
	}

	var entry = this.m_all_entries_hash[id];
	if(entry != null && entry != undefined){
		if(new_id != id){
			entry.m_id = new_id;
			this.m_all_entries_hash[new_id] = entry;
			delete this.m_all_entries_hash[id];
		}
		if(attr != null){
			entry.setAttrHash(attr);
		}
		entry.m_uploading = uploading;

		if(uploading){
			var send_data = entry.getAttrHash();
			send_data.update_id = entry.getId();

			var self = this;
			kakeibo.model.RequestQueue.pushRequest("POST", "kakeibo/update", send_data, function(status, data) {
				if(status == "success"){
					kakeibo.model.SummaryTable.refresh();
					if(self.m_on_update_entry != null){
						var entry = self.m_all_entries_hash[data.entry_id];
						entry.m_uploading = false;
						self.m_on_update_entry(entry);
					}
				}
				else{
					alert("upload error!");
				}
			});
		}

		if(this.m_on_update_entry != null){
			this.m_on_update_entry(entry);
		}

		return entry;
	}
	else{
		return null;
	}
}

kakeibo.model.KakeiboEntrySet.setUpdateEntryListener = function(func){
	this.m_on_update_entry = func;
}

/*
 * KakeiboEntryAttr (singleton)
 */
kakeibo.model.KakeiboEntryAttrConverter = {

	str2date: function(val){
		if(val == null || val == ""){
			return null;
		}

		var now = new Date();
		var year = 0;
		var month = 0;
		var day = 0;
		var token = val.split("/");
		if(token.length == 3){
			day = parseInt(token[2], 10);
			year = parseInt(token[0], 10);
			month = parseInt(token[1], 10);
		}
		else if(val.length == 2){
			year = now.getFullYear();
			month = now.getMonth() + 1;
			day = parseInt(val, 10);
		}
		else if(val.length == 4){
			year = now.getFullYear();
			month = parseInt(val.substring(0, 2), 10);
			day = parseInt(val.substring(2, 4), 10);
		}
		else if(val.length == 6){
			year = 2000 + parseInt(val.substring(0, 2), 10);
			month = parseInt(val.substring(2, 4), 10);
			day = parseInt(val.substring(4, 6), 10);
		}
		else if(val.length == 8){
			year = parseInt(val.substring(0, 4), 10);
			month = parseInt(val.substring(4, 6), 10);
			day = parseInt(val.substring(6, 8), 10);
		}
		var dt = new Date(year, month - 1, day);
		if(dt != null && dt.getFullYear() == year && dt.getMonth() + 1 == month && dt.getDate() == day) {
			return dt;
		}
		return null;
	},

	str2amount: function(val){
		if(val == null || val == ""){
			return null;
		}
		var tmp = val.replace(/,/g, "");
		if(tmp.match( /^[0-9]+$/ )){
			return parseInt(tmp, 10);
		}
		return null;
	},

	str2category: function(val){
		if(val == null || val == ""){
			return null;
		}
		var category_num = val.split(":")[0].replace(/(^\s+)|(\s+$)/g, "");
		var category = kakeibo.category_set.getByShortcut(category_num);
		return category;
	},

	str2leafCategory: function(val){
		var category = kakeibo.model.KakeiboEntryAttrConverter.str2category(val);
		if(category == null || category.getNumChildren() > 0){
			return null;
		}
		return category;
	},

	amount2str: function(val){
		return kakeibo.utils.addFigure(val);
	},

	date2str: function(val){
		return '' + val.getFullYear() + '/' +  ('00' + (val.getMonth() + 1)).slice(-2) + '/' + ('00' + val.getDate()).slice(-2);
	},

	category2str: function(val){
		return val.getShortcut() + " : " + val.getName() + " (" + val.getParent().getName() + ")";
	}
};
