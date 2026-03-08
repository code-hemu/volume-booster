/*******************************************************************************
 * 
    Volume Booster - Increase sound
    Copyright (C) 2020-present Hemanta gayen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/code-hemu/volume-booster
*/

let oldTabsSignature = "";
const getTabsSignature = (tabs)=> {
  return tabs
    .map(t => `${t.id}-${t.url}-${t.title}`)
    .sort()
    .join("|");
}

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
  } catch {
    console.error(`Invalid selector: ${selector}`);
    return null;
  }
};

var app = {
  "tab":{
    "id": async function() {
      try {
        const [tab] = await API.tabs.query({ active: true, currentWindow: true });
        return tab ? tab.id : null;
      } catch (error) {
        console.error("Error fetching active tab:", error);
        return null;
      }
    },
    "audio": function (callback){
      API.tabs.query({audible: true, windowType: "normal"}, function (tabs) {
        if (tabs && tabs.length) {
          callback(tabs);
        };
      });
    },
    "update": function(){
      app.popup.list();
      API.tabs.onUpdated.addListener(function (e) {
        app.popup.list();
      });
    }
  },
  "list": {
    "create": function () {
      app.tab.audio((tabs=[])=>{
        if (tabs.length){
          const signature = getTabsSignature(tabs);
          if (signature == oldTabsSignature) return;
          oldTabsSignature = signature;
          app.list.remove();
          $(".tabs__title").textContent = API.i18n.getMessage(0 < tabs.length ? 'active_tabs' : 'deactive_tabs');

          tabs.sort((currentTab, oldTab) => currentTab.id - oldTab.id);

          tabs.forEach(tab => {
              const fragment = $("#template-tab").content.cloneNode(true);
              const tabElement = fragment.querySelector(".tab");

              tabElement.dataset.tabId = tab.id;
              const icon = fragment.querySelector(".tab__icon-image");
              if (icon && tab.favIconUrl) {
                icon.src = tab.favIconUrl;
              }

              const tabTitle = fragment.querySelector(".tab__title");
              if (tabTitle) {
                tabTitle.textContent = tab.title;
              }

              if (tab.id == app.popup.id() && $("title")) {
                $("title").textContent = tab.title;
              }

              $(".tabs__list").appendChild(document.importNode(fragment, true));
          });

          $(".tabs__list").classList.toggle("more", tabs.length > 2);
        } else {
          app.list.remove();
        }
      });
    },
    "remove": function() {
      const allTab = document.querySelectorAll("a.tab");
      if (allTab) {
        for(element of allTab){
          const parentElement = element.parentNode; 
          parentElement.removeChild(element); 
        }
      }
    }
  },
  "popup": {
    "id": function() {
      const urlParams = new URLSearchParams(window.location.search);
      const popupId = urlParams.get("tabId");
      return urlParams ? popupId ? popupId : null : null;
    },
    "load": async function() {
      app.volume.get();
      app.tab.update();

      const methods = {
        ...app.interface.set,
        ...app.interface.click
      };

      for (const key in methods) {
        if (typeof methods[key] === "function") {
          await methods[key]();
        }
      }
    },
    "list": function(){
      DEBOUNCE(app.list.create(), 500);
    },
    "close": function(tabId) {
      const popupId = app.popup.id();
      console.log(tabId);
      if(popupId) {
        if(popupId == tabId){
          window.close();
        } else {
          app.popup.list();
        }
      }
    }
  },
  "volume":{
    "set": function(val){
      let volume = Math.round(100 * Number(val));
      if (!Number.isInteger(volume)) volume = 0;
      $(".volume-current-value").innerText = volume;
      $(".volume-slider").value = volume;
      app.volume.animation.val(volume);
    },
    "get": async function(){
      console.log("query ok");
      const popupId = app.popup.id();
      const tabId = popupId ? popupId : (await app.tab.id());
      app.background.send("query", {tabId: tabId, popup: popupId != null ? true : false});
    },
    "animation": {
      "set": function () {
        this.speakerAnimation = new SpeakerAnimation('#speaker');
      },
      "val": function (val) {
        if (this.speakerAnimation) this.speakerAnimation.gain(val);
      }
    }
  },
  "storage": {
    "set": function(key, value) {
      return new Promise((resolve) => {
        API.storage.local.set({[key]: value}, resolve);
      });
    },
    "get": function(key) {
      return new Promise((resolve) => {
        API.storage.local.get([key], (result) => {
          resolve(result[key]);
        });
      });
    }
  },  
  "background": {
    "port": null,
    "message": {},
    "receive": function (id, callback) {
      if (id) {
        app.background.message[id] = callback;
      }
    },
    "send": function (id, data) {
      if (id) {
        API.runtime.sendMessage({
          "method": id,
          "data": data,
          "path": "popup-to-background"
        }, function () {
          return API.runtime.lastError;
        });
      }
    },
    "connect": function (port) {
      API.runtime.onMessage.addListener(app.background.listener); 
      if (port) {
        app.background.port = port;
        app.background.port.onMessage.addListener(app.background.listener);
        app.background.port.onDisconnect.addListener(function () {
          app.background.port = null;
        });
      }
    },
    "post": function (id, data) {
      if (id) {
        if (app.background.port) {
          app.background.port.postMessage({
            "method": id,
            "data": data,
            "path": "popup-to-background",
            "port": app.background.port.name
          });
        }
      }
    },
    "listener": function (e) {
      if (e) {
        for (const id in app.background.message) {
          if (app.background.message[id]) {
            if ((typeof app.background.message[id]) === "function") {
              if (e.path === "background-to-popup") {
                if (e.method === id) {
                  app.background.message[id](e.data);
                }
              }
            }
          }
        }
      }
    }
  },
  "interface": {
    "set": {
      "size": function() {
        if (app.popup.id() == null) {
          const body = document.body;
          const html = document.documentElement;
          if (body && html) {
            body.style.width = "410px";
            html.style.height = "auto";
          }
        }
      },
      "links": function() {
          $("#header-icons a")? $("#header-icons a").href = LINKS.support : '';
          $(".footer-fb").addEventListener("click", function () {app.background.send("url", {"url": LINKS.facebook})});
          $(".footer-yt").addEventListener("click", function () {app.background.send("url", {"url": LINKS.youtube})});
          $(".footer-web").addEventListener("click", function () {app.background.send("url", {"url": LINKS.twitter})});
      },
      "button": function(){
        $(".popupbtn span").textContent = API.i18n.getMessage(app.popup.id() ? "close": "popup");
        
        if(app.popup.id()) {
          $(".popupbtn").style.background = "#fc6060";
          $(".popupbtn img").src = "../icons/close.svg";
        }

        app.storage.get("darkMode").then((darkMode)=>{
          $("#toogle").checked = darkMode;
          const isDark = $("body").classList.contains('dark');
          if (darkMode) {
            if (!isDark){
              $("body").classList.add('dark')
            }
          }else{
            if (isDark){
              $("body").classList.remove('dark');
            }
          }
        });
      },
      "security": function() {
        document.addEventListener('contextmenu', (event) => {
          event.preventDefault();
        });

        document.addEventListener('keydown', (event) => {
          // F12
          if (event.key === 'F12') {
            event.preventDefault();
          }

          // Ctrl+Shift+I (or Cmd+Shift+I on Mac)
          if ((event.ctrlKey || event.metaKey) &&
              event.shiftKey &&
              event.key.toLowerCase() === 'i') {
            event.preventDefault();
          }

          // Ctrl+U (View Source)
          if ((event.ctrlKey || event.metaKey) &&
              event.key.toLowerCase() === 'u') {
            event.preventDefault();
          }
        });
      },
      "animation": function() {
        app.volume.animation.set();
      },
      "copyright": function() {
        const name = API.runtime.getManifest().name;
        const version = API.runtime.getManifest().version;  
        $(".footer-text").innerText = `${name} v.${version}`;
      },
      "trenslate": function() {
        return new Promise((resolve) => {
          const elements = document.querySelectorAll("[data-message]");
          for (const element of elements) {
            const key = element.dataset.message;
            const message = API.i18n.getMessage(key);
            if (message) {
              element.textContent = message;
            } else {
              console.error("Missing chrome.i18n message:", key);
            }
          }
          resolve();
        });
      }
    },
    "click": {
      "list": function() {
        $(".tabs__list").addEventListener("click", (event) => {
          event.preventDefault();
          const ele = event.target.closest(".tab");
          const tabId = parseInt(ele.dataset.tabId, 10);
          API.tabs.update(tabId, {active: true}, (tab) => {
              API.windows.update(tab.windowId, {
                  focused: true
              });
              API.runtime.lastError || (app.popup.id() == null ? app.popup.close(tabId) : null);
          });
        },false);
      },
      "rate": function() {
        $(".star").forEach((event)=>{
          event.addEventListener("click",(target)=>{
            const atr = target.currentTarget.getAttribute("data-action");
            atr == 'support' ? 
            app.background.send("url", {"url":  LINKS.support}) :
            atr == 'review' ? 
            app.background.send("url", {"url":  LINKS.review}) : '';
          });
        });
      },
      "mode": function() {
        $("#toogle").addEventListener("click",async (event)=> {
          const darkMode = event.currentTarget.checked;
          const isDark = $("body").classList.contains('dark');
          await app.storage.set("darkMode", darkMode); 
          if (darkMode) {
            if (!isDark){
              $("body").classList.add('dark')
            }
          }else{
            if (isDark){
              $("body").classList.remove('dark');
            }
          }
        });
      },
      "mute": function() {
        $(".speaker").addEventListener("click", async ()=> {
          app.volume.animation.val(0);
          $(".volume-slider").value = 0;
          $(".volume-current-value").innerText = 0;
          const tabId = app.popup.id() ? app.popup.id() : (await app.tab.id());
          app.background.send("volume", {"value":"0", "tabId": tabId});
        });
      },
      "popup": function() {
        $(".popupbtn").addEventListener("click", async ()=>{
          const data = app.popup.id() == null ? {"tabId": await app.tab.id()} : null;
          app.background.send("popup", data);
          window.close();
        });
      },
      "reset": function() {
        $(".resetbtn").addEventListener("click", ()=>{
          app.volume.set(1);
          app.background.send("reset");
          const reset_img = $(".resetbtn img");
          if (reset_img) {
            reset_img.style.transform =  
            reset_img.style.transform == '' ? "rotate(720deg) translateZ(0)" : '';        
          }
        });
      },
      "slider": function() {
        $(".volume-slider").addEventListener("input", async (event)=> {
          const range = event.currentTarget.value;
          const value = Number(range);
          $(".volume-current-value").innerText = value;
          const tabId = app.popup.id() ? app.popup.id() : (await app.tab.id());
          app.background.send("volume", {"value": range, "tabId": tabId});
          app.volume.animation.val(value);
        });
      }
    }
  }
};

app.background.connect(API.runtime.connect({"name": "popup"}));
app.background.receive("volume", app.volume.set);
app.background.receive("close", app.popup.close);
window.addEventListener("load", app.popup.load, false);

