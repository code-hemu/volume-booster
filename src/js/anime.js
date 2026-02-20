class SpeakerAnimation {
    constructor(element, options = {}) {
        this.drag = null;
        this.element = element;
        this.maincolor = options.maincolor || '#4b92b9';
        this.crosscolor = options.crosscolor || '#20a2ed';

        if (document.querySelector(this.element)) {
            this.speaker = this.createSpeaker();
            if (this.speaker) {
                this.animation();
            } else {
                console.error('Failed to create speaker element.');
            }
        } else {
            console.error(`Element ${this.element} not found in the document.`);
        }
    }

    createSpeaker() {
        const speaker = document.createElementNS("http://www.w3.org/2000/svg","svg");
        speaker.setAttribute('viewBox', '0 0 100 77');
        speaker.setAttribute('xmlns',"http://www.w3.org/2000/svg");

        const path = document.createElementNS('http://www.w3.org/2000/svg','path');
        path.id = 'speakB';
        path.setAttribute('class', 'volElem');
        path.setAttribute('stroke', this.maincolor);
        path.setAttribute('opacity', '0.4');
        path.setAttribute('d', 'M51.2,18.5v-13c0-2.1-2.5-3.3-4.1-1.9L21.8,25.9c-1.4,1.2-3.1,1.9-4.9,1.9H8.2c-2.3,0-4.2,1.9-4.2,4.2v13.3c0,2.3,1.9,4.2,4.2,4.2H17c1.9,0,3.7,0.7,5.1,1.9l25,22c1.6,1.4,4.1,0.3,4.1-1.9v-13');

        const path2 = document.createElementNS('http://www.w3.org/2000/svg','path');
        path2.id = 'speakF';
        path2.setAttribute('class', 'volElem');
        path2.setAttribute('stroke', this.maincolor);
        path2.setAttribute('d', 'M51.2,18.5v-13c0-2.1-2.5-3.3-4.1-1.9L21.8,25.9c-1.4,1.2-3.1,1.9-4.9,1.9H8.2c-2.3,0-4.2,1.9-4.2,4.2v13.3c0,2.3,1.9,4.2,4.2,4.2H17c1.9,0,3.7,0.7,5.1,1.9l25,22c1.6,1.4,4.1,0.3,4.1-1.9v-13');

        const path3 = document.createElementNS('http://www.w3.org/2000/svg','path');
        path3.id = 'arcBigB';
        path3.setAttribute('class', 'volElem');
        path3.setAttribute('stroke', this.maincolor);
        path3.setAttribute('opacity', '0.4');
        path3.setAttribute('d', 'M72.2,64.1C81.1,59,87,49.4,87,38.5c0-10.9-5.9-20.5-14.8-25.6');

        const path4 = document.createElementNS('http://www.w3.org/2000/svg','path');
        path4.id = 'arcBigF';
        path4.setAttribute('class', 'volElem');
        path4.setAttribute('stroke', this.maincolor);
        path4.setAttribute('d', 'M72.2,64.1C81.1,59,87,49.4,87,38.5c0-10.9-5.9-20.5-14.8-25.6');

        const path5 = document.createElementNS('http://www.w3.org/2000/svg','path');
        path5.id = 'arcSmB';
        path5.setAttribute('class', 'volElem');
        path5.setAttribute('stroke', this.maincolor);
        path5.setAttribute('opacity', '0.4');
        path5.setAttribute('d', 'M59,51.3c4.4-2.6,7.4-7.4,7.4-12.8s-3-10.3-7.4-12.8');

        const path6 = document.createElementNS('http://www.w3.org/2000/svg','path');
        path6.id = 'arcSmF';
        path6.setAttribute('class', 'volElem');
        path6.setAttribute('stroke', this.maincolor);
        path6.setAttribute('d', 'M59,51.3c4.4-2.6,7.4-7.4,7.4-12.8s-3-10.3-7.4-12.8');

        const line1 = document.createElementNS('http://www.w3.org/2000/svg','line');
        line1.id = 'crossLtRb';
        line1.setAttribute('class', 'volElem');
        line1.setAttribute('opacity', '0.6');
        line1.setAttribute('stroke', this.crosscolor);
        line1.setAttribute('x1', '43.8');
        line1.setAttribute('y1', '29.2');
        line1.setAttribute('x2', '62.6');
        line1.setAttribute('y2', '47.8');
        line1.setAttribute('transform', 'scale(0)');

        const line2 = document.createElementNS('http://www.w3.org/2000/svg','line');
        line2.id = 'crossLbRt';
        line2.setAttribute('class', 'volElem');
        line2.setAttribute('opacity', '0.6');
        line2.setAttribute('stroke', this.crosscolor);
        line2.setAttribute('x1', '62.6');
        line2.setAttribute('y1', '29.2');
        line2.setAttribute('x2', '43.8');
        line2.setAttribute('y2', '47.8');
        line2.setAttribute('transform', 'scale(0)');

        speaker.appendChild(path);
        speaker.appendChild(path2);
        speaker.appendChild(path3);
        speaker.appendChild(path4);
        speaker.appendChild(path5);
        speaker.appendChild(path6);
        speaker.appendChild(line1);
        speaker.appendChild(line2);
        document.querySelector(this.element).appendChild(speaker);

        return speaker;
    }

    qs(el) {
        return document.querySelector(el);
    }

    gain(val) {
        if (this.drag) {
            if(this.drag.curCx != undefined) {
                this.drag.curCx = val;
                this.drag.animateDrag();
            }
        }
    }

    getCenter(line = {}) {
        return {
            x: (+line.getAttribute("x1") + +line.getAttribute("x2")) / 2,
            y: (+line.getAttribute("y1") + +line.getAttribute("y2")) / 2
        }
    }

    getScalePoint(obj = {}, onScene = true) {
        if (!onScene) {
            let svgRect = obj.getBBox();
            return {
                x: svgRect.x + svgRect.width / 2,
                y: svgRect.y + svgRect.height / 2
            }
        }
        let rect = obj.getBoundingClientRect();
        return {
            x: rect.width / 2,
            y: rect.height / 2
        }
    }

    animation() {
        var fromTo = (from, to, prgrs = 0) => from + (to - from) * prgrs;

        var volObj = {
            speakB: this.qs("#speakB"),
            arcBigB: this.qs("#arcBigB"),
            arcSmB: this.qs("#arcSmB"),

            speakF: this.qs("#speakF"),
            arcBigF: this.qs("#arcBigF"),
            arcSmF: this.qs("#arcSmF"),

            crossLtRb: this.qs("#crossLtRb"),
            crossLbRt: this.qs("#crossLbRt")
        };

        var pathLen = {
            arcBigLen: volObj.arcBigF.getTotalLength(),
            arcSmLen: volObj.arcSmF.getTotalLength(),
            speakLen: volObj.speakF.getTotalLength()
        };

        var transforms = {
            translate3D: function (x = 0, y = 0, z = 0, el = "px") {
                return `translate3D(${x}${el}, ${y}${el}, ${z}${el})`;
            },

            translate: function (x = 0, y = 0, el = "px") {
                return `translate(${x}${el}, ${y}${el})`;
            },

            rotate3d: function (x = 0, y = 0, z = 0, deg = 0) {
                return `rotate3d(${x}, ${y}, ${z}, ${deg}deg)`;
            },

            rotate: function (deg = 0) {
                return `rotate(${deg}deg)`;
            },

            scale: function (x = 1, y = 1) {
                return `scale(${x}, ${y})`;
            },

            perspective: function (val = 0, el = "px") {
                return `perspective(${val}${el})`;
            }
        };

        var easing = {
            inCubic: function (t, b, c, d) {
                var ts = (t /= d) * t;
                var tc = ts * t;
                return b + c * (1.7 * tc * ts - 2.05 * ts * ts + 1.5 * tc - 0.2 * ts + 0.05 * t);
            },

            outElastic: function (t, b, c, d) {
                var ts = (t /= d) * t;
                var tc = ts * t;
                return b + c * (33 * tc * ts + -106 * ts * ts + 126 * tc + -67 * ts + 15 * t);
            },

            customSin: function (t, b, c, d) {
                var ts = (t /= d) * t;
                var tc = ts * t;
                return b + c * (81 * tc * ts + -210 * ts * ts + 190 * tc + -70 * ts + 10 * t);
            }
        };

        let drag = {
            dx: 0,
            maxX: 600,
            minX: 0,
            curCx: 600,

            pointBig: this.getScalePoint(volObj.arcBigF),
            pointSm: this.getScalePoint(volObj.arcSmF),

            interact: false,

            animateDrag: function () {
                this.curCx += this.dx;
                let cx = this.curCx;

                let smLen = pathLen.arcSmLen;
                let bgLen = pathLen.arcBigLen;

                if (cx > this.maxX) { cx = this.maxX; }
                if (cx < this.minX) { cx = this.minX; }

                let progress = (cx - this.minX) / (this.maxX - this.minX);
                play.curPos = progress;


                let scaleFactor = fromTo(1, 0.85, 1 - progress);
                let scaleDxBig = fromTo(0, -3, 1 - progress);
                let scaleDxSm = fromTo(0, -1, 1 - progress);

                [volObj.arcBigF, volObj.arcBigB].forEach((el) => {
                    play.curPosBig.x = -this.pointBig.x * (scaleFactor - 1) + scaleDxBig;
                    play.curPosBig.y = -this.pointBig.y * (scaleFactor - 1) * 1.5;
                    play.curPosBig.scale = scaleFactor;
                    el.setAttribute("transform",
                    transforms.translate(play.curPosBig.x, play.curPosBig.y, "")
                    + transforms.scale(scaleFactor, scaleFactor)
                    );
                });

                [volObj.arcSmF, volObj.arcSmB].forEach((el) => {
                    play.curPosSm.x = -this.pointSm.x * (scaleFactor - 1) + scaleDxSm;
                    play.curPosSm.y = -this.pointSm.y * (scaleFactor - 1) * 3;
                    play.curPosSm.scale = scaleFactor;
                    el.setAttribute("transform",
                    transforms.translate(play.curPosSm.x, play.curPosSm.y, "")
                    + transforms.scale(scaleFactor, scaleFactor)
                    );
                });

                if (progress > 0.5) {
                    if (play.off) { play.onRefresh(); }
                    let prgForBig = fromTo(1, -1, 1 - progress);
                    volObj.arcBigF.setAttribute("visibility", "visible");
                    volObj.arcSmF.setAttribute("visibility", "visible");
                    volObj.arcBigF.setAttribute("stroke-dasharray", bgLen * prgForBig + "," + bgLen * 1.05);
                    volObj.arcBigF.setAttribute("stroke-dashoffset", -bgLen * (1 - prgForBig) / 2 + "");
                    volObj.arcSmF.setAttribute("stroke-dasharray", smLen + "");
                    volObj.arcSmF.setAttribute("stroke-dashoffset", "0");
                }

                if (progress <= 0.5 && progress > 0) {
                    if (play.off) { play.onRefresh(); }
                    let prgForSm = fromTo(1, 0, 1 - progress * 2);
                    volObj.arcBigF.setAttribute("visibility", "hidden");
                    volObj.arcSmF.setAttribute("visibility", "visible");
                    volObj.arcSmF.setAttribute("stroke-dasharray", smLen * prgForSm + "," + smLen * 1.05);
                    volObj.arcSmF.setAttribute("stroke-dashoffset", -smLen * (1 - prgForSm) / 2 + "");
                }

                if (progress <= 0) {
                    volObj.arcSmF.setAttribute("visibility", "hidden");
                    if (play.off == false) { play.offRefresh(); }
                }
            }
        };

        var play = {
            dx: 1 / 5,
            ds: 0.03,
            flag: true,
            step: 0,
            speed: 5,

            curPosBig: {
                x: 0,
                y: 0,
                scale: 1
            },

            curPosSm: {
                x: 0,
                y: 0,
                scale: 1
            },

            curPos: 1,

            off: false,
            offCurStep: 100,
            offMaxStep: 100,
            offSpeed: 2,
            offRefresh: function () {
                this.offCurStep = this.offMaxStep;
                this.off = true;
            },

            on: false,
            onCurStep: 0,
            onMaxStep: 20,
            onSpeed: 2,
            onRefresh: function () {
                this.off = false;
                this.onCurStep = 0;
                this.on = true;
            },

            pointLbRt: this.getCenter(volObj.crossLbRt),
            pointLtRb: this.getCenter(volObj.crossLtRb),

            animation: function () {
            if (this.off) {
                [volObj.arcBigB, volObj.arcBigF, volObj.arcSmB, volObj.arcSmF].forEach((el) => {
                    el.setAttribute("visibility", "hidden");
                });
                [volObj.crossLbRt, volObj.crossLtRb].forEach((el) => {
                    el.setAttribute("visibility", "visible");
                });

                let len = pathLen.speakLen;
                let step1 = 20;
                let step2 = this.offMaxStep - step1;
                let backLen = 0.7;

                if (this.offCurStep >= this.offMaxStep - step1) {
                    let progress = (step1 + this.offCurStep - this.offMaxStep) / step1;
                    let progressB = fromTo(1, backLen, 1 - progress);
                    volObj.speakF.setAttribute("stroke-dasharray", len * progress + "," + len * 1.05);
                    volObj.speakF.setAttribute("stroke-dashoffset", -len * (1 - progress) / 2 + "");
                    volObj.speakB.setAttribute("stroke-dasharray", len * progressB + "," + len * 1.05);
                    volObj.speakB.setAttribute("stroke-dashoffset", -len * (1 - progressB) / 2 + "");
                }

                if (this.offCurStep < step2 && this.offCurStep >= step2 - step1) {
                    let progress = 1 - (this.offCurStep - step2 + step1) / step1;
                    let progressB = fromTo(backLen, 1, progress);
                    volObj.speakB.setAttribute("stroke-dasharray", len * progressB + "," + len * 1.05);
                    volObj.speakB.setAttribute("stroke-dashoffset", -len * (1 - progressB) / 2 + "");
                }

                if (this.offCurStep < step2 && this.offCurStep >= 0) {
                    volObj.speakF.setAttribute("visibility", "hidden");
                    let progress = this.offCurStep / step2;
                    [volObj.crossLbRt, volObj.crossLtRb].forEach((el, index) => {
                        let scale = easing.outElastic(1 - progress, 0, 1, 1);
                        let dx = index == 0 ?
                        easing.customSin(1 - progress, -3, 3, 1) :
                        easing.customSin(1 - progress, -2, 2, 1);
                        let dy = index == 0 ?
                        easing.customSin(1 - progress, -2, 2, 1) :
                        easing.customSin(1 - progress, 2, -2, 1);
                        let x = -this.pointLbRt.x * (scale - 1) + dx;
                        let y = -this.pointLbRt.y * (scale - 1) + dy;
                        el.setAttribute("transform",
                        transforms.translate(x, y, "") +
                        transforms.scale(scale, scale));
                    });
                }
                this.offCurStep += -this.offSpeed;
            }

            else {
                if (this.on) {
                    [volObj.speakF, volObj.arcBigB, volObj.arcSmB, volObj.arcSmF].forEach((el) => {
                        el.setAttribute("visibility", "visible");
                    });
                    [volObj.crossLbRt, volObj.crossLtRb].forEach((el) => {
                        el.setAttribute("visibility", "hidden");
                        el.setAttribute("transform", "scale(0)");
                    });
                    let len = pathLen.speakLen;
                    let progress = this.onCurStep / this.onMaxStep;
                    volObj.speakF.setAttribute("stroke-dasharray", len * progress + "," + len * 1.05);
                    volObj.speakF.setAttribute("stroke-dashoffset", -len * (1 - progress) / 2 + "");
                    this.onCurStep += this.onSpeed;
                }

                let dxBig, dxSm, sclFactB, sclFactSm;
                if (this.step >= this.speed) {
                    this.flag = !this.flag;
                    this.step = 0;
                }
                let progress = this.step / this.speed;
                let amplitudeB = 1 - easing.inCubic(1 - this.curPos, 0, 1, 0.5);
                let amplitudeS = 1 - easing.inCubic(1 - this.curPos, 0, 1, 1);

                if (this.curPos < 0.5) amplitudeB = 0;
                if (amplitudeS <= 0 || !amplitudeS) amplitudeS = 0;

                if (this.flag) {
                    dxBig = fromTo(0, this.dx * 3, progress);
                    dxSm = fromTo(0, -this.dx * 2, progress);
                    sclFactB = fromTo(0, this.ds, progress);
                    sclFactSm = fromTo(0, -this.ds, progress);
                } else {
                    dxBig = fromTo(this.dx * 3, 0, progress);
                    dxSm = fromTo(-this.dx * 2, 0, progress);
                    sclFactB = fromTo(this.ds, 0, progress);
                    sclFactSm = fromTo(-this.ds, 0, progress);
                }

                [volObj.arcBigF, volObj.arcBigB].forEach((el) => {
                    let scale = this.curPosBig.scale + sclFactB * amplitudeB;
                    let y = -drag.pointBig.y * (scale - 1) * 1.5;
                    el.setAttribute("transform",
                        transforms.translate(this.curPosBig.x + dxBig * amplitudeB, y, "")
                        + transforms.scale(scale, scale)
                    );
                });

                [volObj.arcSmF, volObj.arcSmB].forEach((el) => {
                    let scale = this.curPosSm.scale + sclFactSm * amplitudeS;
                    let y = -drag.pointSm.y * (scale - 1) * 3;
                    el.setAttribute("transform",
                        transforms.translate(this.curPosSm.x + dxSm * amplitudeS, y, "")
                        + transforms.scale(scale, scale)
                    );
                });
                this.step++;
            }
            requestAnimationFrame(this.animation.bind(play));
            }
        };
        requestAnimationFrame(play.animation.bind(play));
        this.drag = drag;
    }

}