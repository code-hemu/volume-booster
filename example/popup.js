const API = chrome || browser;
var gainNode = null;

const mediaSource = (id) => {
  return new Promise((resolve, reject) => {
    resolve(navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: id
        }
      }
    }));
  })
};


document.addEventListener('DOMContentLoaded', async () => {
  const slider = document.getElementById('volume');
  const level = document.getElementById('level');

  const consumerId = (await API.tabs.getCurrent())?.id;
   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	
  API.tabCapture.getMediaStreamId({
	  consumerTabId: consumerId,
	  targetTabId: tab.id
	}, async (streamId) => {
		if (!API.runtime.lastError) {
		    const stream = await mediaSource(streamId);
		    if (!API.runtime.lastError) {
		    	const audioCtx = new AudioContext();
		    	const source = audioCtx.createMediaStreamSource(stream);
				gainNode = audioCtx.createGain();
				source.connect(gainNode);
				gainNode.connect(audioCtx.destination);
		    }
		}
  });


  slider.oninput = () => {
  	level.textContent = slider.value + '%';
  	if (gainNode) gainNode.gain.value = slider.value / 100;
  }
});