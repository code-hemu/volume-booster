const API = (() => {
  if (typeof browser !== 'undefined') return browser;
  if (typeof chrome !== 'undefined') return chrome;
  throw new Error('Extension API not found');
})();

const background = (function() {
    const tmp = {};

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

const offscreen = {}; offscreen.audioStates = {};

offscreen.context = {
    "create": async function(data) {
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
                        
                        // 🎚️ Bass
                        const bass = audioCtx.createBiquadFilter();
                        bass.type = "lowshelf";
                        bass.frequency.value = 200;
                        bass.gain.value = 0;

                        // 🎚️ Mid
                        const mid = audioCtx.createBiquadFilter();
                        mid.type = "peaking";
                        mid.frequency.value = 1000;
                        mid.Q.value = 1;
                        mid.gain.value = 0;

                        // 🎚️ Treble
                        const treble = audioCtx.createBiquadFilter();
                        treble.type = "highshelf";
                        treble.frequency.value = 3000;
                        treble.gain.value = 0;

                        // 🔊 Volume
                        const gain = audioCtx.createGain();
                        gain.gain.value = 1.0;

                        // 🎛️ Compressor
                        const compressor = audioCtx.createDynamicsCompressor();

                        // 🔧 Tune compressor (important!)
                        compressor.threshold.value = -24; // when compression starts
                        compressor.knee.value = 30;       // smooth transition
                        compressor.ratio.value = 4;       // compression strength
                        compressor.attack.value = 0.003;  // fast response
                        compressor.release.value = 0.25;  // recovery time

                        // Connect chain
                        source.connect(bass);
                        bass.connect(mid);
                        mid.connect(treble);
                        treble.connect(gain);
                        gain.connect(compressor);
                        compressor.connect(audioCtx.destination);

                        // Save
                        offscreen.audioStates[data.tabId] = {
                            stream: stream,
                            audioContext: audioCtx,
                            gainNode: gain,
                            bassNode: bass,
                            midNode: mid,
                            trebleNode: treble,
                            compressorNode: compressor
                        };
                    }
                } catch(e){
                    console.error("Error capturing tab:", e);
                }
            }
        }
    },
    "remove": function(tabId){
        if(offscreen.audioStates[tabId] != null){
            offscreen.audioStates[tabId].stream?.getTracks().forEach(t => t.stop());
            offscreen.audioStates[tabId].audioContext?.close();
            delete offscreen.audioStates[tabId];
        }
    }
}

offscreen.query = {
    "set": function(data){
        console.log(data);
        if(data.type !== undefined && data.tabId !== undefined){
            const value = offscreen.query.get(data.tabId, data.type);
            background.send("query", {type: data.type, val: value});
        }
    },

    "get": function(tabId, type){
        const state = offscreen.audioStates[tabId];

        switch(type){
            case "volume":
                const val = state ? state.gainNode.gain.value : 1;
                return Math.round(100 * Number(val));

            case "bass":
                return state ? state.bassNode.gain.value : 0;

            case "mid":
                return state ? state.midNode.gain.value : 0;

            case "treble":
                return state ? state.trebleNode.gain.value : 0;

            default:
                return false;
        }
    }
}

offscreen.boost = {
    set: async function(data){
        if (data.tabId !== undefined && data.value !== undefined && data.type !== undefined){

            const state = offscreen.audioStates[data.tabId];
            if (state) {
                background.send("badge", data);
                switch(data.type){
                    case "volume":
                        state.gainNode.gain.value = data.value / 100;
                        break;

                    case "bass":
                        state.bassNode.gain.value = data.value;
                        break;

                    case "mid":
                        state.midNode.gain.value = data.value;
                        break;

                    case "treble":
                        state.trebleNode.gain.value = data.value;
                        break;
                }
            } else{
                await offscreen.context.create(data);
            }
        }
    }
};

background.receive("remove", offscreen.context.remove);
background.receive("query", offscreen.query.set);
background.receive("boost", offscreen.boost.set);
