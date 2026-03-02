const API = (() => {
  if (typeof browser !== 'undefined') return browser;
  if (typeof chrome !== 'undefined') return chrome;
  throw new Error('Extension API not found');
})();

const LINKS = {
    "options": API.runtime.getURL("data/offscreen/offscreen.html"),
    "support": API.runtime.getManifest().homepage_url,
    "review": `https://store.whale.naver.com/detail/${API.runtime.id}`,
    "facebook": "https://www.facebook.com/codehemu/",
    "youtube": "https://www.youtube.com/@CodeHemu",
    "twitter": "https://x.com/CodeHemu"
};

const DEBOUNCE = (callback, delay) => {
  if (typeof callback !== "function") {
    return false;
  }

  let timer;
  return function(...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(function() {
      callback.apply(context, args);
    }, delay);
  };
};