// var config = {
//   "id" : function() {
//     const urlParams = new URLSearchParams(window.location.search);
//     return urlParams ? urlParams.get("tabId") ? urlParams.get("tabId") :null :null;
//   },
//   "set":{
//     "anim": (e)=>{
//       drag ? drag.curCx != undefined ? (drag.curCx = e, drag.animateDrag()) : null : null;
//     },
//     "volume": (e)=>{
//       $(".volume-slider").value = parseInt(e * 100 /600);
//       $(".volume-current-value").innerText = e;
//       config.set.anim(e);
//     },
//     "link": ()=>{
//       $(".footer-text").innerText = `${API.runtime.getManifest().name} v.${API.runtime.getManifest().version}.0`
//       $("#header-icons a") ? $("#header-icons a").href = `${homepage}2022/09/speaker-booster.html#CSS3` : '';
//       $(".footer-fb").addEventListener("click", function () {background.send("open", {"url": 'https://www.facebook.com/codehemu/'})});
//       $(".footer-yt").addEventListener("click", function () {background.send("open", {"url": 'https://www.youtube.com/@CodeHemu'})});
//       $(".footer-web").addEventListener("click", function () {background.send("open", {"url": `${homepage}2022/09/speaker-booster.html`})});
//     },
//     "rate": ()=>{
//       $(".star").forEach((event)=>{
//         event.addEventListener("click",(target)=>{
//           const atr = target.currentTarget.getAttribute("data-action");
//           atr == 'support' ? 
//           background.send("open", {"url":  `${homepage}p/reporting.html?app=${API.runtime.getManifest().name}&version=${API.runtime.getManifest().version}`}) :
//           atr == 'review' ? 
//           background.send("open", {"url":  `https://chromewebstore.google.com/detail/${API.runtime.id}/reviews`}) : '';
//         });
//       });
//     },
//     "mode": async()=>{
//       responseOptions = await config.storage();
//       $("#toogle").checked = responseOptions.darkMode;
//       config.mode(responseOptions.darkMode);

//       $("#toogle").addEventListener("click",async (event)=> {
//         const darkMode = event.currentTarget.checked;
//         await API.storage.local.set({darkMode});
//         config.mode(darkMode)
//       });
//     },
//     "list": async()=> {
//       let allTab = document.querySelectorAll("a.tab");
//       if (allTab) {
//         for(element of allTab){
//           const parentElement = element.parentNode; 
//           // Remove the child element from the parent
//           parentElement.removeChild(element); 
//         }
//       }

//       const active_tab = await config.get.list();

//       if (active_tab) {
//         const active_text = API.i18n.getMessage('active_tabs');
//         const deactive_text = API.i18n.getMessage('deactive_tabs');
//         $(".tabs__title").textContent = config.id() == null ? 0 < active_tab.length ? active_text : deactive_text : deactive_text;
//         active_tab.forEach(tab => {
//             const ele = (config.id()!=null ? $("#template-tab"): active_tab.length > 2 ? $("#template-tab2") : $("#template-tab")).content;
//             ele.querySelector(".tab").dataset.tabId = tab.id;
//             ele.querySelector(".tab__icon-image").src = tab.favIconUrl;
//             ele.querySelector(".tab__title").textContent = tab.title;
//             config.id()==null? $(".tabs__list").appendChild(document.importNode(ele, true)) :
//             config.id() == tab.id ? 
//             ($(".tabs__list").appendChild(document.importNode(ele, true)),
//               $(".tabs__title").textContent = active_text,
//               $("title")[0].textContent = tab.title) : null;
//           });

//           if (2 < active_tab.length && config.id()== null) {
//             if (!$(".tabs__list").classList.contains('tabs__grid')){
//               $(".tabs__list").classList.add('tabs__grid')
//             }
//           }else{
//             if ($(".tabs__list").classList.contains('tabs__grid')){
//               $(".tabs__list").classList.remove('tabs__grid')
//             }
//           }
//       }
//     },
//     "button": function(e){
//       if (e==0) {
//         $(".popupbtn").disabled = true;
//         $(".popupbtn").style.background = "#fc6060";
//         $(".popupbtn").style.cursor = "no-drop";
//         $(".popupbtn img").src = "../icons/window.svg";
//       }else if (e==1) {
//         $(".popupbtn").disabled = false;
//         $(".popupbtn").style.background = "var(--btn-color)";
//         $(".popupbtn").style.cursor = "pointer";
//         $(".popupbtn img").src = "../icons/popup.svg";
//       }else if (e==2) {
//         $(".popupbtn").disabled = true;
//         $(".popupbtn").style.background = "#4bb97f";
//         $(".popupbtn").style.cursor = "no-drop";
//         $(".popupbtn img").src = "../icons/window.svg";
//       }
//     }

//   },
//   "get":{
//     "list": ()=>{
//       return new Promise((resolve, reject) =>{
//         let row_tab;
//         API.tabs.query({
//           audible: true,
//           windowType: "normal"
//         },(tabs)=>{
//           tabs.sort((currentTab, oldTab)=> currentTab.id - oldTab.id);
//           row_tab = []
//           tabs.forEach(tab => {
//             if (`chrome-extension://${API.runtime.id}/data/options/options.html` != tab.url) {
//               row_tab.push(tab);
//             }
//           });
//           resolve(row_tab);
//         })
        
//       });
//     },
//     "tab": async()=>{
//       return new Promise(((resolve, reject) => {
//             chrome.tabs.query({
//                 active: true
//             }, (tabs => {
//                 chrome.runtime.lastError || (this.playingTabId = tabs[0].id, resolve(this.playingTabId))
//             }))
//       }))
//     },
//     "player": async()=>{
//       responseOptions = await config.storage();
//       currentTab = await config.get.tab();
//       const audioStates = responseOptions.audioStates;
//       if (audioStates && currentTab) {
//         if (audioStates[currentTab]) {
//           return currentTab;
//         }else{
//           return false;
//         }
//       }else{
//         return false;
//       }
//     }
//   },
//   "event": async()=> {
//     $(".tabs__list").addEventListener("click", (event) => {
//       event.preventDefault();
//       const ele = event.target.closest(".tab");
//       const tabId = parseInt(ele.dataset.tabId, 10);
//       API.tabs.update(tabId, {active: true}, (tab) => {
//           API.windows.update(tab.windowId, {
//               focused: true
//           })
//       });
//     },false);

//     $(".popupbtn").addEventListener("click", async ()=>{
//         background.send("popup_open");
//         window.close();
//     });

//     $(".volume-slider").addEventListener("input", (event)=> {
//       var range = event.currentTarget.value;
//       $(".volume-current-value").innerText = range * 6;
//       config.set.anim(range * 6);
//       config.id()!= null ? background.send("volume", {"value":range,"tabId": config.id()}) : background.send("volume", {"value":range}); 
      
//     });

//     $(".speaker").addEventListener("click", async ()=>{
//       config.set.anim(0);
//       $(".volume-slider").value = 0;
//       $(".volume-current-value").innerText = 0;
//       config.id()!= null ? background.send("mute", config.id()) : background.send("mute");
//     });

//     $(".resetbtn").addEventListener("click", async ()=>{
//       if ($(".resetbtn img")) {
//         $(".resetbtn img").style.transform =  
//         $(".resetbtn img").style.transform == '' ? "rotate(720deg) translateZ(0)" : '';        
//       }
//       config.set.volume(100);
//       config.set.button(0);
//       background.send("pintab_reset");
//     });
//   },
//   "close": function(e){
//       config.id()!= null ? e == config.id() ? window.close() : null: null;
//   },
//   "mode": function(e) {
//     if (!$("body")) return;
//     if (e) {
//       if (!$("body").classList.contains('dark')){
//         $("body").classList.add('dark')
//       }
//     }else{
//       if ($("body").classList.contains('dark')){
//         $("body").classList.remove('dark')
//       }
//     }
//   },
//   "storage": async()=> {
//     return new Promise((resolve, reject) =>{
//         API.storage.local.get({
//           "darkMode": false,
//           "audioStates": false
//         }, (options)=>{
//             resolve(options);
//         })
//       });
//   },
//   "speaker": function speaker() {
//     var qs = (el = "") => document.querySelector(el);
//     var fromTo = (from, to, prgrs = 0) => from + (to - from) * prgrs;
//     var getCenter = (line = {}) => {
//       return {
//         x: (+line.getAttribute("x1") + +line.getAttribute("x2")) / 2,
//         y: (+line.getAttribute("y1") + +line.getAttribute("y2")) / 2
//       }
//     };
//     var getScalePoint = (obj = {}, onScene = true) => {
//       if (!onScene) {
//         let svgRect = obj.getBBox();
//         return {
//           x: svgRect.x + svgRect.width / 2,
//           y: svgRect.y + svgRect.height / 2
//         }
//       }
//       let rect = obj.getBoundingClientRect();
//       return {
//         x: rect.width / 2,
//         y: rect.height / 2
//       }
//     };

//     var volObj = {
//       speakB: qs("#speakB"),
//       arcBigB: qs("#arcBigB"),
//       arcSmB: qs("#arcSmB"),

//       speakF: qs("#speakF"),
//       arcBigF: qs("#arcBigF"),
//       arcSmF: qs("#arcSmF"),

//       crossLtRb: qs("#crossLtRb"),
//       crossLbRt: qs("#crossLbRt")
//     };

//     var pathLen = {
//       arcBigLen: volObj.arcBigF.getTotalLength(),
//       arcSmLen: volObj.arcSmF.getTotalLength(),
//       speakLen: volObj.speakF.getTotalLength()
//     };

//     var transforms = {
//       translate3D: function (x = 0, y = 0, z = 0, el = "px") {
//         return `translate3D(${x}${el}, ${y}${el}, ${z}${el})`;
//       },

//       translate: function (x = 0, y = 0, el = "px") {
//         return `translate(${x}${el}, ${y}${el})`;
//       },

//       rotate3d: function (x = 0, y = 0, z = 0, deg = 0) {
//         return `rotate3d(${x}, ${y}, ${z}, ${deg}deg)`;
//       },

//       rotate: function (deg = 0) {
//         return `rotate(${deg}deg)`;
//       },

//       scale: function (x = 1, y = 1) {
//         return `scale(${x}, ${y})`;
//       },

//       perspective: function (val = 0, el = "px") {
//         return `perspective(${val}${el})`;
//       }
//     };

//     var easing = {
//       inCubic: function (t, b, c, d) {
//         var ts = (t /= d) * t;
//         var tc = ts * t;
//         return b + c * (1.7 * tc * ts - 2.05 * ts * ts + 1.5 * tc - 0.2 * ts + 0.05 * t);
//       },

//       outElastic: function (t, b, c, d) {
//         var ts = (t /= d) * t;
//         var tc = ts * t;
//         return b + c * (33 * tc * ts + -106 * ts * ts + 126 * tc + -67 * ts + 15 * t);
//       },

//       customSin: function (t, b, c, d) {
//         var ts = (t /= d) * t;
//         var tc = ts * t;
//         return b + c * (81 * tc * ts + -210 * ts * ts + 190 * tc + -70 * ts + 10 * t);
//       }
//     };

//     var play = {
//       dx: 1 / 5,
//       ds: 0.03,
//       flag: true,
//       step: 0,
//       speed: 5,

//       curPosBig: {
//         x: 0,
//         y: 0,
//         scale: 1
//       },

//       curPosSm: {
//         x: 0,
//         y: 0,
//         scale: 1
//       },

//       curPos: 1,

//       off: false,
//       offCurStep: 100,
//       offMaxStep: 100,
//       offSpeed: 2,
//       offRefresh: function () {
//         this.offCurStep = this.offMaxStep;
//         this.off = true;
//       },

//       on: false,
//       onCurStep: 0,
//       onMaxStep: 20,
//       onSpeed: 2,
//       onRefresh: function () {
//         this.off = false;
//         this.onCurStep = 0;
//         this.on = true;
//       },

//       pointLbRt: getCenter(volObj.crossLbRt),
//       pointLtRb: getCenter(volObj.crossLtRb),

//       animation: function () {
//         if (this.off) { // animation when volume became 0
//           [volObj.arcBigB, volObj.arcBigF, volObj.arcSmB, volObj.arcSmF].forEach((el) => {
//             el.setAttribute("visibility", "hidden");
//           });
//           [volObj.crossLbRt, volObj.crossLtRb].forEach((el) => {
//             el.setAttribute("visibility", "visible");
//           });

//           let len = pathLen.speakLen;
//           let step1 = 20;
//           let step2 = this.offMaxStep - step1;
//           let backLen = 0.7;

//           if (this.offCurStep >= this.offMaxStep - step1) {
//             let progress = (step1 + this.offCurStep - this.offMaxStep) / step1;
//             let progressB = fromTo(1, backLen, 1 - progress);
//             volObj.speakF.setAttribute("stroke-dasharray", len * progress + "," + len * 1.05);
//             volObj.speakF.setAttribute("stroke-dashoffset", -len * (1 - progress) / 2 + "");
//             volObj.speakB.setAttribute("stroke-dasharray", len * progressB + "," + len * 1.05);
//             volObj.speakB.setAttribute("stroke-dashoffset", -len * (1 - progressB) / 2 + "");
//           }

//           if (this.offCurStep < step2 && this.offCurStep >= step2 - step1) {
//             let progress = 1 - (this.offCurStep - step2 + step1) / step1;
//             let progressB = fromTo(backLen, 1, progress);
//             volObj.speakB.setAttribute("stroke-dasharray", len * progressB + "," + len * 1.05);
//             volObj.speakB.setAttribute("stroke-dashoffset", -len * (1 - progressB) / 2 + "");
//           }

//           if (this.offCurStep < step2 && this.offCurStep >= 0) {
//             volObj.speakF.setAttribute("visibility", "hidden");
//             let progress = this.offCurStep / step2;
//             [volObj.crossLbRt, volObj.crossLtRb].forEach((el, index) => {
//               let scale = easing.outElastic(1 - progress, 0, 1, 1);
//               let dx = index == 0 ?
//                 easing.customSin(1 - progress, -3, 3, 1) :
//                 easing.customSin(1 - progress, -2, 2, 1);
//               let dy = index == 0 ?
//                 easing.customSin(1 - progress, -2, 2, 1) :
//                 easing.customSin(1 - progress, 2, -2, 1);
//               let x = -this.pointLbRt.x * (scale - 1) + dx;
//               let y = -this.pointLbRt.y * (scale - 1) + dy;
//               el.setAttribute("transform",
//                 transforms.translate(x, y, "") +
//                 transforms.scale(scale, scale));
//             });
//           }
//           this.offCurStep += -this.offSpeed;
//         }
//         else {
//           if (this.on) {
//             [volObj.speakF, volObj.arcBigB, volObj.arcSmB, volObj.arcSmF].forEach((el) => {
//               el.setAttribute("visibility", "visible");
//             });
//             [volObj.crossLbRt, volObj.crossLtRb].forEach((el) => {
//               el.setAttribute("visibility", "hidden");
//               el.setAttribute("transform", "scale(0)");
//             });
//             let len = pathLen.speakLen;
//             let progress = this.onCurStep / this.onMaxStep;
//             volObj.speakF.setAttribute("stroke-dasharray", len * progress + "," + len * 1.05);
//             volObj.speakF.setAttribute("stroke-dashoffset", -len * (1 - progress) / 2 + "");
//             this.onCurStep += this.onSpeed;
//           }

//           let dxBig, dxSm, sclFactB, sclFactSm;
//           if (this.step >= this.speed) {
//             this.flag = !this.flag;
//             this.step = 0;
//           }
//           let progress = this.step / this.speed;
//           let amplitudeB = 1 - easing.inCubic(1 - this.curPos, 0, 1, 0.5);
//           let amplitudeS = 1 - easing.inCubic(1 - this.curPos, 0, 1, 1);

//           if (this.curPos < 0.5) amplitudeB = 0;
//           if (amplitudeS <= 0 || !amplitudeS) amplitudeS = 0;

//           if (this.flag) {
//             dxBig = fromTo(0, this.dx * 3, progress);
//             dxSm = fromTo(0, -this.dx * 2, progress);
//             sclFactB = fromTo(0, this.ds, progress);
//             sclFactSm = fromTo(0, -this.ds, progress);
//           }
//           else {
//             dxBig = fromTo(this.dx * 3, 0, progress);
//             dxSm = fromTo(-this.dx * 2, 0, progress);
//             sclFactB = fromTo(this.ds, 0, progress);
//             sclFactSm = fromTo(-this.ds, 0, progress);
//           }

//           [volObj.arcBigF, volObj.arcBigB].forEach((el) => {
//             let scale = this.curPosBig.scale + sclFactB * amplitudeB;
//             let y = -drag.pointBig.y * (scale - 1) * 1.5;
//             el.setAttribute("transform",
//               transforms.translate(this.curPosBig.x + dxBig * amplitudeB, y, "")
//               + transforms.scale(scale, scale)
//             );
//           });

//           [volObj.arcSmF, volObj.arcSmB].forEach((el) => {
//             let scale = this.curPosSm.scale + sclFactSm * amplitudeS;
//             let y = -drag.pointSm.y * (scale - 1) * 3;
//             el.setAttribute("transform",
//               transforms.translate(this.curPosSm.x + dxSm * amplitudeS, y, "")
//               + transforms.scale(scale, scale)
//             );
//           });
//           this.step++;
//         }
//         requestAnimationFrame(this.animation.bind(play));
//       }
//     };

//     requestAnimationFrame(play.animation.bind(play));

//     drag = {
//       dx: 0,
//       maxX: 600,
//       minX: 0,
//       curCx: 600,

//       pointBig: getScalePoint(volObj.arcBigF),
//       pointSm: getScalePoint(volObj.arcSmF),

//       interact: false,

//       animateDrag: function () {
//         this.curCx += this.dx;
//         let cx = this.curCx;

//         let smLen = pathLen.arcSmLen;
//         let bgLen = pathLen.arcBigLen;

//         if (cx > this.maxX) { cx = this.maxX; }
//         if (cx < this.minX) { cx = this.minX; }

//         let progress = (cx - this.minX) / (this.maxX - this.minX);
//         play.curPos = progress;


//         let scaleFactor = fromTo(1, 0.85, 1 - progress);
//         let scaleDxBig = fromTo(0, -3, 1 - progress);
//         let scaleDxSm = fromTo(0, -1, 1 - progress);

//         [volObj.arcBigF, volObj.arcBigB].forEach((el) => {
//           play.curPosBig.x = -this.pointBig.x * (scaleFactor - 1) + scaleDxBig;
//           play.curPosBig.y = -this.pointBig.y * (scaleFactor - 1) * 1.5;
//           play.curPosBig.scale = scaleFactor;
//           el.setAttribute("transform",
//             transforms.translate(play.curPosBig.x, play.curPosBig.y, "")
//             + transforms.scale(scaleFactor, scaleFactor)
//           );
//         });

//         [volObj.arcSmF, volObj.arcSmB].forEach((el) => {
//           play.curPosSm.x = -this.pointSm.x * (scaleFactor - 1) + scaleDxSm;
//           play.curPosSm.y = -this.pointSm.y * (scaleFactor - 1) * 3;
//           play.curPosSm.scale = scaleFactor;
//           el.setAttribute("transform",
//             transforms.translate(play.curPosSm.x, play.curPosSm.y, "")
//             + transforms.scale(scaleFactor, scaleFactor)
//           );
//         });

//         if (progress > 0.5) {
//           if (play.off) { play.onRefresh(); }
//           let prgForBig = fromTo(1, -1, 1 - progress);
//           volObj.arcBigF.setAttribute("visibility", "visible");
//           volObj.arcSmF.setAttribute("visibility", "visible");
//           volObj.arcBigF.setAttribute("stroke-dasharray", bgLen * prgForBig + "," + bgLen * 1.05);
//           volObj.arcBigF.setAttribute("stroke-dashoffset", -bgLen * (1 - prgForBig) / 2 + "");
//           volObj.arcSmF.setAttribute("stroke-dasharray", smLen + "");
//           volObj.arcSmF.setAttribute("stroke-dashoffset", "0");
//         }

//         if (progress <= 0.5 && progress > 0) {
//           if (play.off) { play.onRefresh(); }
//           let prgForSm = fromTo(1, 0, 1 - progress * 2);
//           volObj.arcBigF.setAttribute("visibility", "hidden");
//           volObj.arcSmF.setAttribute("visibility", "visible");
//           volObj.arcSmF.setAttribute("stroke-dasharray", smLen * prgForSm + "," + smLen * 1.05);
//           volObj.arcSmF.setAttribute("stroke-dashoffset", -smLen * (1 - prgForSm) / 2 + "");
//         }

//         if (progress <= 0) {
//           volObj.arcSmF.setAttribute("visibility", "hidden");
//           if (play.off == false) { play.offRefresh(); }
//         }
//       }
//     };
//   },
//   "debounce": function(callback, delay) {
//     let timer
//     return function() {
//       clearTimeout(timer)
//       timer = setTimeout(() => {
//         callback();
//       }, delay)
//     }
//   },
//   "popup": function() {
//     config.set.button(config.id()==null ? 0 : 2);

//     if (config.id()==null) {
//       $(".volume-slider").addEventListener("change", async()=> {
//         const player = await config.get.player();
//         if (player) {
//           const active_tab = await config.get.list();
//           if (active_tab) {
//             active_tab.forEach(tab => {
//               if (tab.id == player) {
//                 config.set.button(1);
//               }
//             });
//           }
//         }else{
//           config.set.button(0);
//         }
//       });
//     }else{
//       $(".resetbtn").disabled = true;
//       $(".resetbtn").style.background = "#fc6060";
//       $(".resetbtn").style.cursor = "no-drop";
//     }

//   },
//   "translate": function() {
//     return new Promise((resolve) => {
//       const elements = document.querySelectorAll("[data-message]");
//       for (const element of elements) {
//         const key = element.dataset.message;
//         const message = chrome.i18n.getMessage(key);
//         if (message) {
//           element.textContent = message;
//         } else {
//           console.error("Missing chrome.i18n message:", key);
//         }
//       }
//       resolve();
//     });
//   },
//   "setup": function() {
//     config.set.list();
//     config.set.link();
//     config.set.rate();
//     config.set.mode();
//   },
//   "load": async ()=> {
//     API.tabs.onUpdated.addListener(config.debounce(config.set.list, 500));
//     API.tabs.onRemoved.addListener(config.close);
//     background.send("load", config.id()==null ? await config.get.tab() : null);
//     config.translate(); 
//     config.speaker();
//     config.event(); 
//     config.setup(); 
//     config.popup(); 
//   }
          
// }

// background.connect(API.runtime.connect({"name": "popup"}));

// background.receive("close", config.close);
// background.receive("set", config.set.volume);


// window.addEventListener("load", config.load, false);
