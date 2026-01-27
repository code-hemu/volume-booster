export {};
/* ===============================
   Global drag reference
================================ */

let drag: DragState;
/* ===============================
   Type definitions
================================ */

type Point = {
  x: number;
  y: number;
};

type ScalePoint = {
  x: number;
  y: number;
};

type VolObjects = {
  speakB: SVGPathElement;
  arcBigB: SVGPathElement;
  arcSmB: SVGPathElement;

  speakF: SVGPathElement;
  arcBigF: SVGPathElement;
  arcSmF: SVGPathElement;

  crossLtRb: SVGLineElement;
  crossLbRt: SVGLineElement;
};

type PathLengths = {
  arcBigLen: number;
  arcSmLen: number;
  speakLen: number;
};

type DragState = {
  dx: number;
  maxX: number;
  minX: number;
  curCx: number;

  pointBig: ScalePoint;
  pointSm: ScalePoint;

  interact: boolean;
  animateDrag: () => void;
};


/* ===============================
   Main function
================================ */

function speaker(): void {
  const qs = <T extends Element = Element>(el: string): T =>
    document.querySelector(el) as T;

  const fromTo = (from: number, to: number, prgrs = 0): number =>
    from + (to - from) * prgrs;

  const getCenter = (line: SVGLineElement): Point => ({
    x: (+line.getAttribute("x1")! + +line.getAttribute("x2")!) / 2,
    y: (+line.getAttribute("y1")! + +line.getAttribute("y2")!) / 2
  });

  const getScalePoint = (
    obj: SVGGraphicsElement,
    onScene = true
  ): ScalePoint => {
    if (!onScene) {
      const svgRect = obj.getBBox();
      return {
        x: svgRect.x + svgRect.width / 2,
        y: svgRect.y + svgRect.height / 2
      };
    }

    const rect = obj.getBoundingClientRect();
    return {
      x: rect.width / 2,
      y: rect.height / 2
    };
  };

  /* ===============================
     SVG references
  ================================ */

  const volObj: VolObjects = {
    speakB: qs("#speakB"),
    arcBigB: qs("#arcBigB"),
    arcSmB: qs("#arcSmB"),

    speakF: qs("#speakF"),
    arcBigF: qs("#arcBigF"),
    arcSmF: qs("#arcSmF"),

    crossLtRb: qs("#crossLtRb"),
    crossLbRt: qs("#crossLbRt")
  };

  const pathLen: PathLengths = {
    arcBigLen: volObj.arcBigF.getTotalLength(),
    arcSmLen: volObj.arcSmF.getTotalLength(),
    speakLen: volObj.speakF.getTotalLength()
  };

  /* ===============================
     Transform helpers
  ================================ */

  const transforms = {
    translate(x = 0, y = 0, el = "px"): string {
      return `translate(${x}${el}, ${y}${el})`;
    },
    scale(x = 1, y = 1): string {
      return `scale(${x}, ${y})`;
    }
  };

  /* ===============================
     Easing
  ================================ */

  const easing = {
    inCubic(t: number, b: number, c: number, d: number): number {
      const ts = (t /= d) * t;
      const tc = ts * t;
      return b + c * (1.7 * tc * ts - 2.05 * ts * ts + 1.5 * tc - 0.2 * ts + 0.05 * t);
    },

    outElastic(t: number, b: number, c: number, d: number): number {
      const ts = (t /= d) * t;
      const tc = ts * t;
      return b + c * (33 * tc * ts - 106 * ts * ts + 126 * tc - 67 * ts + 15 * t);
    },

    customSin(t: number, b: number, c: number, d: number): number {
      const ts = (t /= d) * t;
      const tc = ts * t;
      return b + c * (81 * tc * ts - 210 * ts * ts + 190 * tc - 70 * ts + 10 * t);
    }
  };

  /* ===============================
     Animation state
  ================================ */

  const play = {
    dx: 1 / 5,
    ds: 0.03,
    flag: true,
    step: 0,
    speed: 5,

    curPosBig: { x: 0, y: 0, scale: 1 },
    curPosSm: { x: 0, y: 0, scale: 1 },

    curPos: 1,

    off: false,
    offCurStep: 100,
    offMaxStep: 100,
    offSpeed: 2,

    on: false,
    onCurStep: 0,
    onMaxStep: 20,
    onSpeed: 2,

    pointLbRt: getCenter(volObj.crossLbRt),
    pointLtRb: getCenter(volObj.crossLtRb),

    offRefresh(): void {
      this.offCurStep = this.offMaxStep;
      this.off = true;
    },

    onRefresh(): void {
      this.off = false;
      this.onCurStep = 0;
      this.on = true;
    },

    animation(): void {
      if (this.off) { // animation when volume became 0
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
          }
          else {
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
      requestAnimationFrame(this.animation.bind(this));
    }
  };

  requestAnimationFrame(play.animation.bind(play));

  /* ===============================
     Drag controller
  ================================ */

  drag = {
    dx: 0,
    maxX: 600,
    minX: 0,
    curCx: 600,

    pointBig: getScalePoint(volObj.arcBigF),
    pointSm: getScalePoint(volObj.arcSmF),

    interact: false,

    animateDrag(): void {
      this.curCx += this.dx;

      let cx = this.curCx;
      if (cx > this.maxX) cx = this.maxX;
      if (cx < this.minX) cx = this.minX;

      const progress = (cx - this.minX) / (this.maxX - this.minX);
      play.curPos = progress;

      const scaleFactor = fromTo(1, 0.85, 1 - progress);
      const scaleDxBig = fromTo(0, -3, 1 - progress);
      const scaleDxSm = fromTo(0, -1, 1 - progress);

      [volObj.arcBigF, volObj.arcBigB].forEach(el => {
        play.curPosBig.x = -this.pointBig.x * (scaleFactor - 1) + scaleDxBig;
        play.curPosBig.y = -this.pointBig.y * (scaleFactor - 1) * 1.5;
        play.curPosBig.scale = scaleFactor;

        el.setAttribute(
          "transform",
          transforms.translate(play.curPosBig.x, play.curPosBig.y, "") +
            transforms.scale(scaleFactor, scaleFactor)
        );
      });

      [volObj.arcSmF, volObj.arcSmB].forEach(el => {
        play.curPosSm.x = -this.pointSm.x * (scaleFactor - 1) + scaleDxSm;
        play.curPosSm.y = -this.pointSm.y * (scaleFactor - 1) * 3;
        play.curPosSm.scale = scaleFactor;

        el.setAttribute(
          "transform",
          transforms.translate(play.curPosSm.x, play.curPosSm.y, "") +
            transforms.scale(scaleFactor, scaleFactor)
        );
      });

      let smLen = pathLen.arcSmLen;
      let bgLen = pathLen.arcBigLen;

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
}