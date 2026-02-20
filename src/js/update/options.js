var background = (function() {
    let tmp = {};
    /*  */
    chrome.runtime.onMessage.addListener(function(request) {
        for (let id in tmp) {
            if (tmp[id] && (typeof tmp[id] === "function")) {
                if (request.path === "background-to-page") {
                    if (request.method === id) {
                        tmp[id](request.data);
                    }
                }
            }
        }
    });
    /*  */
    return {
        "receive": function(id, callback) {
            tmp[id] = callback;
        },
        "send": function(id, data) {
            chrome.runtime.sendMessage({
                "method": id,
                "data": data,
                "path": "page-to-background"
            }, function() {
                return chrome.runtime.lastError;
            });
        }
    }
})();

var app = {};
app.audioStates = {};

app.set = {
    "volume": function(tabId, volume) {
        if (app.audioStates[tabId]) {
            app.audioStates[tabId].gainNode.gain.value = volume / 100;
        }
    },
    "text": (tabId, volume) => {
        const numericTabId = Number(tabId);
        if (Number.isInteger(numericTabId)) {
            API.action.setBadgeText({ text: String(volume), tabId: numericTabId });
        }
    },
    "context": function(data) {
        console.log(data);
        if(data.tabId && data.value){
            if (Object.hasOwn(app.audioStates, data.tabId)) {
                app.set.volume(data.tabId, data.value);
                app.set.text(data.tabId, data.value);
            } else{
                try{
                    API.tabCapture.capture({
                        audio: true,
                        video: false
                    }, async (stream) => {
                        if (!chrome.runtime.lastError) {
                            const audio = new Promise(async(resolve) => {
                                const audioCtx = new window.AudioContext();

                                const source = audioCtx.createMediaStreamSource(stream);
                                const gain = audioCtx.createGain();

                                const analyser = audioCtx.createAnalyser();
                                analyser.fftSize = 256              

                                source.connect(gain);
                                gain.connect(analyser);
                                analyser.connect(audioCtx.destination);

                                resolve({
                                    audioContext: audioCtx,
                                    gainNode: gain,
                                    analyserNode: analyser
                                });                                
                            });
                            audio.then(async (options)=>{
                                app.audioStates[data.tabId] = options;
                                app.set.volume(data.tabId, data.value);
                                app.set.text(data.tabId, data.value);
                                await API.storage.local.set({"audioStates": app.audioStates});
                            });
                        }
                    });
                } catch(e){
                    console.error("Error capturing tab:", e);
                }
            }
        }
    }
}

app.tab ={
    "change": function(){
        API.tabCapture.onStatusChanged.addListener(function(changeInfo){
            try {
                if(changeInfo.status == "active" && changeInfo.tabId){
                    API.storage.local.set({fullScreen: true},()=>{
                        API.windows.getCurrent(((tab)=> {
                            const tabID = tab.id;
                            API.storage.local.get("fullScreen", (result) => {
                                if(result["fullScreen"] && result["fullScreen"] !== false){
                                    if (changeInfo.fullscreen == 1){
                                        API.storage.local.set({windowState: tab.state});
                                        API.windows.update(tabID, {state: "fullscreen"},null);
                                    } else {
                                        API.storage.local.get("windowState", (result) => {
                                            if(result["windowState"]){
                                                API.windows.update(tabID, {state: result["windowState"]}, null);
                                            }
                                        });
                                    }
                                } else {
                                    API.windows.update(tabID, {state: tab.state}, null);
                                }
                            });
                        }));
                    });
                }
            }catch (error) {
                console.error("Tab capture fullscreen handler error:", error);
            }
        });
    },
    "remove": function(){
        API.tabs.onRemoved.addListener(function(tabId) {
            if (app.audioStates[tabId]) {
                app.audioStates[tabId].audioContext.close();
                delete app.audioStates[tabId];
            }
        });
    }

}

app.get = {
    "volume": function(tabId){
        if(tabId){
            const val = Object.hasOwn(app.audioStates, tabId) ? app.audioStates[tabId].gainNode.gain.value : 1;
            background.send("volume-value", val);
        }
    }
}

app.load = function(){
    app.tab.change();
    app.tab.remove();
}

background.receive("volume", app.set.context);
background.receive("volume-value", app.get.volume);
window.addEventListener("load", app.load, false);

