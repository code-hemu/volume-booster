var core = {
    "start": function() {
        core.load();
    },
    "install": function() {
        core.load();
    },
    "load": function() {
        app.interface.id = '';
    },
    "open": function(e) {
        app.tab.open(e.url);
    },
    "action": {
        "pintab": {
            "open": function(e) {
                app.popup.send("close", e);
                app.pintab.open(()=>{
                    core.action.volume.get();
                    app.popup.send("setup");
                })
            },
            "reset": function() {
                API.tabs.query({
                    audible: true
                },tabs=>{
                    tabs.forEach(tab => {
                      if (`chrome-extension://${API.runtime.id}/data/options/options.html` == tab.url) {
                        API.tabs.remove(tab.id);
                        core.action.pintab.open();
                      }
                    });
                });
            }
        },
        "volume":{
            "set": function(data) {
                if (data) {
                    if(data.value){
                        let p = parseInt(data.value * 6);
                        if (data.tabId) {
                            let t = parseInt(data.tabId);
                            API.runtime.sendMessage({
                                action: "popup-volume-change",
                                tabId: t,
                                sliderValue: p
                            })
                        }else{
                            if (tab) {
                              API.runtime.sendMessage({
                                action: "popup-volume-change",
                                tabId: tab,
                                sliderValue: p
                              })  
                            }
                        }
                    }
                }
                
                
            },
            "get": function (){
                if (tab !== null) {
                    app.pintab.receive.gainValue(tab, (value)=>{
                        if (value.gainValue !== null) {
                            const i = value.gainValue;
                            var range = Math.ceil(100*i);
                            app.popup.send("set", range);
                        }else app.popup.send("set", 100);
                    })
                }
            },
            "mute": function(id) {
                if (id) {
                    API.runtime.sendMessage({
                        action: "popup-volume-change",
                        tabId: id,
                        sliderValue: 0
                    })
                }else{
                    API.runtime.sendMessage({
                        action: "popup-volume-change",
                        tabId: tab,
                        sliderValue: 0
                    })
                }
            }
        },
        "storage": function(changes, namespace) {
            /*  */
        },
        "removed": function(e) {
            if (e === app.interface.id) {
                app.interface.id = '';
            }
        },
        "interface": function() {
            const context = config.interface.context;
            
        },
        "popup": function() {
            new Promise(async (resolve, reject) => {
             API.tabs.query({
                active: true
             }, (tabs=>{
                    chrome.runtime.lastError || app.interface.create(app.interface.path + '?tabId=' + tabs[0].id);
                }));
            });
          
        }
    }
};


app.popup.receive("open", core.open);
app.popup.receive("load", core.action.pintab.open);
app.popup.receive("pintab_reset", core.action.pintab.reset);
app.popup.receive("popup_open", core.action.popup);
app.popup.receive("volume", core.action.volume.set);
app.popup.receive("mute", core.action.volume.mute);


app.on.startup(core.start);
app.on.installed(core.install);
app.on.storage(core.action.storage);
