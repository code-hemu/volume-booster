var core = {
    "start": function() {
        core.load();
    },
    "install": function() {
        core.load();
    },
    "load": function() {
        core.tab.remove();
        core.tab.fullscreen();
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
        },
        "fullscreen": function(){
            API.tabCapture.onStatusChanged.addListener(async function(info){
                if (info.status === "active" && info.tabId) {
                    console.log("okkkkkkkkkk");
                    await API.storage.local.set({fullScreen: true});

                    const win = await API.windows.getCurrent();
                    const windowId = win.id;
                    const {fullScreen} = await API.storage.local.get("fullScreen");

                    if (fullScreen !== false){
                        if (info.fullscreen==1){
                            await API.storage.local.set({ windowState: win.state});
                            API.windows.update(windowId, { state: "fullscreen"});
                        } else{
                            const { windowState } = await API.storage.local.get("windowState");
                            await API.windows.update(windowId, {
                                state: windowState
                            });
                        }
                    } else{
                        API.windows.update(windowId, {
                            state: win.state
                        }, null);
                    }
                }
            });
        }
    },
    "query": {
        "set": function(data){
            app.popup.send("query", data);
        },
        "get": function(data){ 
            if(data.tabId){
                app.page.send("query", data);
            }
            if(!data.popup) {
                app.popup.send("close", data.tabId);
            }
        }
    },
    "popup": {
        "open": function(data){
            if (data) {
                if (data.tabId) {
                    app.interface.create(app.interface.path + '?tabId=' + data.tabId);
                }
            }
        }
    },
    "reset": function(){
        app.offscreen.close(LINKS.options, async ()=>{
            streamId = Object.keys(config.stream);
            if(streamId?.length) {
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
    "boost": {
        "set": function(data){
            if (data) {
                app.offscreen.create(LINKS.options, async()=>{
                    if(Object.hasOwn(config.stream, data.tabId)){
                        streamId = config.stream[data.tabId].streamId;
                        app.page.send("boost", {...data, streamId});
                    } else {
                        await API.tabCapture.getMediaStreamId({
                            targetTabId: Number(data.tabId)
                        }, (streamId)=>{
                            if(!API.runtime.lastError){
                                app.page.send("boost", {...data, streamId});
                                config.stream[data.tabId] = {
                                    "streamId": streamId
                                }
                            }
                        });
                    }
                });
            }
        }
    }
};

app.popup.receive("reset", core.reset);
app.popup.receive("url", core.tab.open);
app.popup.receive("popup", core.popup.open);
app.popup.receive("query", core.query.get);

app.popup.receive("boost", core.boost.set);

app.page.receive("query", core.query.set);
app.page.receive("badge", core.badge);

app.on.startup(core.start);
app.on.installed(core.install);
