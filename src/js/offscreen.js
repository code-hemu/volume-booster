const API = (() => {
  if (typeof browser !== 'undefined') return browser;
  if (typeof chrome !== 'undefined') return chrome;
  throw new Error('Extension API not found');
})();

const background = (function() {
    let tmp = {};

    API.runtime.onMessage.addListener(function(request) {
        if (request.path === "background-to-page") {
            const handler = tmp[request.method];

            if (typeof handler === "function") {
                handler(request.data);
            }
        }
    });

    return {
        receive: function(id, callback) {
            tmp[id] = callback;
        },

        send: function(id, data) {
            API.runtime.sendMessage({
                method: id,
                data: data,
                path: "page-to-background"
            }, function () {
                return API.runtime.lastError;
            });
        }
    };
})();

var offscreen = {}; offscreen.audioStates = {};

offscreen.volume = {
    "set": async function(data) {
        console.log(data);
        if (Object.hasOwn(offscreen.audioStates, data.tabId) && data.value) {
            if (offscreen.audioStates[data.tabId] != null) {
                offscreen.audioStates[data.tabId].gainNode.gain.value = (data.value / 100);
                background.send("badge", data);
                console.log(data.value / 100);
            }
        } else {
            await offscreen.volume.context(data);
        }
    },
    "get": function(tabId){
        if(tabId){
            const val = Object.hasOwn(offscreen.audioStates, tabId) ? offscreen.audioStates[tabId].gainNode.gain.value : 1;
            background.send("volume", val);
        }
    },
    "remove": function(tabId){
        if(offscreen.audioStates[tabId] != null){
            offscreen.audioStates[tabId].stream?.getTracks().forEach(t => t.stop());
            offscreen.audioStates[tabId].audioContext?.close();
            delete offscreen.audioStates[tabId];
        }
    },
    "context": async function(data) {
        if(data.tabId && data.streamId){
            if (!Object.hasOwn(offscreen.audioStates, data.tabId)) {
                try{
                    offscreen.audioStates[data.tabId] = null;
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            mandatory: {
                                chromeMediaSource: "tab",
                                chromeMediaSourceId: data.streamId
                            }
                        },
                        video: false
                    });
                        
                    if (!API.runtime.lastError) {
                        /*  */
                        const audioCtx = new window.AudioContext();
                        const source = audioCtx.createMediaStreamSource(stream);
                        const gain = audioCtx.createGain();
                        gain.gain.value = 1.0;
                        source.connect(gain);
                        gain.connect(audioCtx.destination);
                        offscreen.audioStates[data.tabId] = {
                            stream: stream,
                            audioContext: audioCtx,
                            gainNode: gain
                        };
                    }
                } catch(e){
                    console.error("Error capturing tab:", e);
                }
            }
        }
    }
}

background.receive("remove", offscreen.volume.remove);
background.receive("volume", offscreen.volume.set);
background.receive("value", offscreen.volume.get);