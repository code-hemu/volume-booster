const API = (() => {
  if (typeof browser !== 'undefined') return browser;
  if (typeof chrome !== 'undefined') return chrome;
  throw new Error('Extension API not found');
})();

const LINKS = {
    "options": API.runtime.getURL("data/options/options.html"),
    "support": API.runtime.getManifest().homepage_url,
    "review": `https://chromewebstore.google.com/detail/${API.runtime.id}/reviews`,
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

const $ = (selector) => {
  if (typeof selector !== "string") {
    console.error("Selector must be a string");
    return null;
  }
  
  if (typeof document === "undefined") {
    console.error("DOM is not available (document is undefined)");
    return null;
  }

  try {
    const elements = document.querySelectorAll(selector);

    if (elements.length === 0) {
      console.warn(`No elements found for selector: ${selector}`);
      return null;
    }

    return elements.length === 1 ? elements[0] : elements;
  } catch (error) {
    console.error(`Invalid selector: ${selector}`);
    return null;
  }
};

var NORMALIZE = (url) => {
  const u = new URL(url);
  return u.origin + u.pathname;
};