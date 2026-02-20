var core = {
    "start": function() {
        core.load();
    },
    "install": function() {
        core.load();
    },
    "load": function() {
        app.interface.id = '';
    }
};

core.url = function(data) {
    if (data) {
        if (data.url) {
            app.tab.open(data.url);
        }
    }
}

core.popup = function(data) {
    if (data) {
        if (data.tabId) {
            app.interface.create(app.interface.path + '?tabId=' + data.tabId);
        }
    }
}

core.set = {
    "volume": function(data) {
        if (data) {
            app.page.send("volume", data);
        }
    },
    "reset": function(){
        app.page.reset();
    }
}

core.get = {
    "volume": function(val){
        app.popup.send("volume-value", val);
    }
}


core.query = function(data){
    if(data.tabId){
        app.page.send("volume-value", data.tabId);
    }
    if(!data.isPopup){
        app.popup.send("is-close", data.tabId);
    }
}

app.popup.receive("url", core.url);
app.popup.receive("popup", core.popup);
app.popup.receive("query", core.query);

app.popup.receive("volume", core.set.volume);
app.popup.receive("reset", core.set.reset);
app.page.receive("volume-value", core.get.volume);
app.page.receive("url", core.url);


app.on.startup(core.start);
app.on.installed(core.install);
