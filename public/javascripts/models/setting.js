
if(!kakeibo.model){
	kakeibo.model = {}; // namespace
}

// singleton class

kakeibo.model.Setting = {};
kakeibo.model.Setting.m_table = {};
kakeibo.model.Setting.m_on_update_list = [];

kakeibo.model.Setting.init = function(table){
	this.m_table = {
		"num-grid-row": "15",
		"num-summary-col": "5"
	};

	for(key in table){
		this.m_table[key] = table[key];
	}
}

kakeibo.model.Setting.getValue = function(key){
	return this.m_table[key];
}

kakeibo.model.Setting.getInt = function(key){
	return parseInt(this.m_table[key], 10);
}

kakeibo.model.Setting.setValue = function(key, val){
	this.m_table[key] = val;

	for(var i = 0; i < this.m_on_update_list.length; i++){
		this.m_on_update_list[i](key);
	}
}

kakeibo.model.Setting.upload = function(call_back){
	var self = this;

	var param = {
		table: this.m_table
	};

	kakeibo.model.RequestQueue.pushRequest("POST", "setting/upload", param, call_back);
}

kakeibo.model.Setting.addUpdateListener = function(func){
	this.m_on_update_list.push(func);
}
