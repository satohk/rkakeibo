
if(!kakeibo.model){
	kakeibo.model = {}; // namespace
}

// singleton class

kakeibo.model.RequestQueue = {};
kakeibo.model.RequestQueue.m_queue = [];
kakeibo.model.RequestQueue.m_queue_size = 0;
kakeibo.model.RequestQueue.m_in_idle = true;

kakeibo.model.RequestQueue.pushRequest = function(method, url, data, call_back){
	if(method != "GET" && method != "POST"){
		return false;
	}

	// data.authenticity_token = $('meta[name="csrf-token"]').attr('content');
	// console.log(data);

	var request = {
		method : method,
		url : url,
		data : data,
		call_back : call_back
	};

	this.m_queue_size++;
	this.m_queue.push(request);

	console.log("queue-size:" + this.m_queue_size + "  queue: " + this.m_queue);

	if(this.m_queue_size == 1 && this.m_in_idle){
		this.execNextRequest();
	}

	return true;
}


kakeibo.model.RequestQueue.removeRequest = function(method, url){
	for(var i = 0; i < this.m_queue_size; i++){
		var req = this.m_queue[i];
		if(req.method == method && req.url == url){
			this.m_queue.splice(i, 1);
			this.m_queue_size--;
		}
	}
}


kakeibo.model.RequestQueue.execNextRequest = function(){
	var self = this;

	if(this.m_queue_size == 0){
		this.m_in_idle = true;
		return false;
	}
	this.m_in_idle = false;

	var req = this.m_queue.shift();
	this.m_queue_size--;

	console.log("exec request : " + req.url + "  data:" + req.data);
	console.log("queue-size:" + this.m_queue_size + "  queue: " + this.m_queue);

	var json_data = {
		json: this.obj2json(req.data)
	};
	console.log(json_data);

	$.ajax({
		type: req.method,
		url: req.url,
		data: json_data,
		cache: false,

		beforeSend : function(xhr) {
			xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))
		},

		success: function(data, dataType){
			if(data.type == "success"){
				console.log("request_queue success");
				req.call_back("success", data);
			}
			else{
				console.log("request_queue error");
				req.call_back("error", data);
			}
			self.execNextRequest();
		},

		dataType: "json",

		error: function(xml_req, status, error){
			console.log("request_queue error2");
			req.call_back("error", error);
			self.execNextRequest();
		}
	});
}


kakeibo.model.RequestQueue.obj2json = function(obj){
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"' + obj + '"';
        return String(obj);
    } else {
        // recurse array or object
        var n, v, json = [], arr = (obj && obj.constructor == Array);
		
        for (n in obj) {
            v = obj[n];
            t = typeof(v);
            if (obj.hasOwnProperty(n)) {
                if (t == "string"){
					v = '"' + v + '"';
				}
				else if (t == "object" && v !== null){
					v = this.obj2json(v);
				}
                json.push((arr ? "" : '"' + n + '":') + String(v));
            }
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
}
