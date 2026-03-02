var core = {
    "start": function() {
        core.load();
    },
    "install": function() {
        core.load();
    },
    "load": function() {
        core.tab.remove();
    },
    "badge": function(data){
        numericTabId = Number(data.tabId);
        if (Number.isInteger(numericTabId)) {
            API.action.setBadgeText({ 
                text: String(Number(data.value)), 
                tabId: numericTabId 
            });
        }
    },
    "tab": {
        "open": function(data) {
            if (data) {
                if (data.url) {
                    app.tab.open(data.url);
                }
            }
        },
        "remove": function(){
            app.tab.on.remove(function(tabId) {
                app.popup.send("close", tabId);
                if (config.stream[tabId]) {
                    app.page.send("remove", tabId);
                    delete config.stream[tabId];
                }
            });
        }
    },
    "popup": {
        "open": function(data){
            if (data) {
                if (data.tabId) {
                    app.interface.create(app.interface.path + '?tabId=' + data.tabId);
                }
            }
        },
        "query": function(data){ 
            if(data.tabId){
                app.page.send("value", data.tabId);
            }
            if(!data.popup) {
                app.popup.send("close", data.tabId);
            }
        }
    },
    "reset": function(){
        app.offscreen.close(LINKS.options, async ()=>{
            streamId = Object.keys(config.stream);
            if(streamId?.length) {
                app.popup.send("volume", 1);
                await Promise.all(streamId.map(async (id) => {
                    const tabId = Number(id);
                    app.tab.get(tabId, (tab)=>{
                        if(tab && !tab.discarded){
                            API.action.setBadgeText({ 
                                text: '', 
                                tabId: tabId
                            });
                        }
                    });
                    console.log("delete stream Id: " + id);
                    delete config.stream[id];
                }));
            }
        });
    },
    "volume": {
        "set": function(data){
            if (data) {
                app.offscreen.create(LINKS.options, async()=>{
                    if(Object.hasOwn(config.stream, data.tabId)){
                        streamId = config.stream[data.tabId].streamId;
                        app.page.send("volume", {...data, streamId});
                    } else {
                        await API.tabCapture.getMediaStreamId({
                            targetTabId: Number(data.tabId)
                        }, (streamId)=>{
                            if(!API.runtime.lastError){
                                app.page.send("volume", {...data, streamId});
                                config.stream[data.tabId] = {
                                    "streamId": streamId
                                }
                            }
                        });
                    }
                });
            }
        },
        "get": function(val){
            console.log(val);
            app.popup.send("volume", val);
        }
    }
};

app.popup.receive("reset", core.reset);
app.popup.receive("url", core.tab.open);
app.popup.receive("popup", core.popup.open);
app.popup.receive("query", core.popup.query);
app.popup.receive("volume", core.volume.set);

app.page.receive("volume", core.volume.get);
app.page.receive("badge", core.badge);

app.on.startup(core.start);
app.on.installed(core.install);
