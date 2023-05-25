<template>
  <div>
    <div class="tool-box">
      <el-button
        size="mini"
        :type="isDrawing ? 'warning' : 'primary'"
        @click="startDraw"
        >绘制区域</el-button
      >

      <el-button
        size="mini"
        type="danger"
        :disabled="isDrawing"
        @click="clearAll"
        >全部清除</el-button
      >
      <el-button
        size="mini"
        type="success"
        :disabled="isDrawing"
        @click="savePoints"
        >保存</el-button
      >
    </div>
    <div class="canvas-wrap">
      <canvas id="imgCanvas" ref="canvaxbox"></canvas>
      <!--用来和鼠标进行交互操作的canvas-->
      <canvas
        id="drawCanvas"
        ref="canvas"
        :style="{ cursor: isDrawing ? 'crosshair' : 'default' }"
      >
      </canvas>
      <!--存储已生成的点线，避免被清空-->
      <canvas id="saveCanvas" ref="canvasSave"></canvas>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      imgUrl: "img/code/wechat-code.jpg",
      isDrawing: false, // 是否正在绘制
      ratio: 1,
      imgWidth: 3020,
      imgHeight: 1080,
      wrapWidth: 300,
      wrapHeight: 300,
      canvasWidth: 300,
      canvasHeight: 300,
      drawingPoints: [],
      drawedPoints: [],
      imgCanvas: null,
      imgCtx: null,
      drawCanvas: null,
      drawCtx: null,
      saveCanvas: null,
      saveCtx: null,
      submitData: [
        // {"polygon":{"x1":0,"y1":0,"x2":1920,"y2":0,"x3":1920,"y3":1080,"x4":0,"y4":1080}},
        {
          polygon: {
            x1: 700,
            y1: 273,
            x2: 975,
            y2: 278,
            x3: 1107,
            y3: 368,
            x4: 718,
            y4: 354,
          },
        },
        {
          polygon: {
            x1: 49,
            y1: 32,
            x2: 183,
            y2: 35,
            x3: 181,
            y3: 100,
            x4: 55,
            y4: 97,
          },
        },
        {
          polygon: {
            x1: 433,
            y1: 250,
            x2: 706,
            y2: 253,
            x3: 707,
            y3: 392,
            x4: 435,
            y4: 393,
          },
        },
        {
          polygon: {
            x1: 45,
            y1: 539,
            x2: 193,
            y2: 538,
            x3: 192,
            y3: 622,
            x4: 41,
            y4: 623,
            x5: 42,
            y5: 623,
          },
        },
      ],
      // [
      //   {"polygon": {"x1":700,"y1":273,"x2":975,"y2":278,"x3":1107,"y3":368,"x4":718,"y4":354}}
      // ]
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initCanvas();
      this.getImage();
    });
    // setTimeout(() => {
    // }, 500);
  },
  methods: {
    initCanvas() {
      // 初始化canvas画布

      let canvasWrap = document.getElementsByClassName("canvas-wrap");
      this.wrapWidth = canvasWrap[0].clientWidth;
      this.wrapHeight = canvasWrap[0].clientHeight;

      this.imgCanvas = document.getElementById("imgCanvas");
      this.imgCtx = this.imgCanvas.getContext("2d");

      // 绘制canvas
      this.drawCanvas = document.getElementById("drawCanvas");
      this.drawCtx = this.drawCanvas.getContext("2d");

      // 保存绘制区域 saveCanvas
      this.saveCanvas = document.getElementById("saveCanvas");
      this.saveCtx = this.saveCanvas.getContext("2d");
      // this.initImgCanvas()
    },
    initImgCanvas() {
      // 计算宽高比
      let ww = this.wrapWidth; // 画布宽度
      let wh = this.wrapHeight; // 画布高度
      let iw = this.imgWidth; // 图片宽度
      let ih = this.imgHeight; // 图片高度

      if (iw / ih < ww / wh) {
        // 以高为主
        this.ratio = ih / wh;
        this.canvasHeight = wh;
        this.canvasWidth = (wh * iw) / ih;
      } else {
        // 以宽为主
        this.ratio = iw / ww;
        this.canvasWidth = ww;
        this.canvasHeight = (ww * ih) / iw;
      }
      // 初始化画布大小
      this.imgCanvas.width = this.canvasWidth;
      this.imgCanvas.height = this.canvasHeight;
      this.drawCanvas.width = this.canvasWidth;
      this.drawCanvas.height = this.canvasHeight;
      this.saveCanvas.width = this.canvasWidth;
      this.saveCanvas.height = this.canvasHeight;

      // 图片加载绘制
      let img = document.createElement("img");
      img.src = this.imgUrl;
      img.onload = () => {
        console.log("图片已加载");
        this.imgCtx.drawImage(img, 0, 0, this.canvasWidth, this.canvasHeight);
        this.renderDatas(); // 渲染原有数据
      };
    },
    startDraw() {
      // 绘制区域
      if (this.isDrawing) return;
      this.isDrawing = true;
      // 绘制逻辑
      this.drawCanvas.addEventListener("click", this.drawImageClickFn);
      this.drawCanvas.addEventListener("dblclick", this.drawImageDblClickFn);
      this.drawCanvas.addEventListener("mousemove", this.drawImageMoveFn);
    },
    clearAll() {
      // 清空所有绘制区域
      this.saveCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.drawedPoints = [];
    },
    getImage() {
      // 这里请求接口 ...

      // this.imgUrl = "https://w.wallhaven.cc/full/6d/wallhaven-6d5k6x.jpg";
      // this.imgWidth = 1920;
      // this.imgHeight = 1080;
      this.imgUrl =
        "https://fastly.picsum.photos/id/866/200/300.jpg?hmac=rcadCENKh4rD6MAp6V_ma-AyWv641M4iiOpe1RyFHeI";
      this.imgWidth = 200;
      this.imgHeight = 300;
      this.imgUrl && this.initImgCanvas();
    },
    drawImageClickFn(e) {
      let drawCtx = this.drawCtx;
      if (e.offsetX || e.layerX) {
        let pointX = e.offsetX == undefined ? e.layerX : e.offsetX;
        let pointY = e.offsetY == undefined ? e.layerY : e.offsetY;
        let lastPoint = this.drawingPoints[this.drawingPoints.length - 1] || [];
        if (lastPoint[0] !== pointX || lastPoint[1] !== pointY) {
          this.drawingPoints.push([pointX, pointY]);
        }
      }
    },
    drawImageMoveFn(e) {
      let drawCtx = this.drawCtx;
      if (e.offsetX || e.layerX) {
        let pointX = e.offsetX == undefined ? e.layerX : e.offsetX;
        let pointY = e.offsetY == undefined ? e.layerY : e.offsetY;
        // 绘制
        drawCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // 绘制点
        drawCtx.fillStyle = "blue";
        this.drawingPoints.forEach((item, i) => {
          drawCtx.beginPath();
          drawCtx.arc(...item, 6, 0, 180);
          drawCtx.fill(); //填充
        });

        // 绘制动态区域
        drawCtx.save();
        drawCtx.beginPath();
        this.drawingPoints.forEach((item, i) => {
          drawCtx.lineTo(...item);
        });
        drawCtx.lineTo(pointX, pointY);
        drawCtx.lineWidth = "3";
        drawCtx.strokeStyle = "blue";
        drawCtx.fillStyle = "rgba(255, 0, 0, 0.3)";
        drawCtx.stroke();
        drawCtx.fill(); //填充
        drawCtx.restore();
      }
    },
    drawImageDblClickFn(e) {
      let drawCtx = this.drawCtx;
      let saveCtx = this.saveCtx;
      if (e.offsetX || e.layerX) {
        let pointX = e.offsetX == undefined ? e.layerX : e.offsetX;
        let pointY = e.offsetY == undefined ? e.layerY : e.offsetY;
        let lastPoint = this.drawingPoints[this.drawingPoints.length - 1] || [];
        if (lastPoint[0] !== pointX || lastPoint[1] !== pointY) {
          this.drawingPoints.push([pointX, pointY]);
        }
      }
      // 清空绘制图层
      drawCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      // 绘制区域至保存图层
      this.drawSaveArea(this.drawingPoints);

      this.drawedPoints.push(this.drawingPoints);
      this.drawingPoints = [];
      this.isDrawing = false;

      // 绘制结束逻辑
      this.drawCanvas.removeEventListener("click", this.drawImageClickFn);
      this.drawCanvas.removeEventListener("dblclick", this.drawImageDblClickFn);
      this.drawCanvas.removeEventListener("mousemove", this.drawImageMoveFn);
    },
    drawSaveArea(points) {
      // console.log(points, "points");
      if (points.length === 0) return;
      this.saveCtx.save();
      this.saveCtx.beginPath();
      points.forEach((item, i) => {
        this.saveCtx.lineTo(...item);
      });
      this.saveCtx.closePath();
      this.saveCtx.lineWidth = "2";
      this.saveCtx.fillStyle = "rgba(255,0, 255, 0.3)";
      this.saveCtx.strokeStyle = "red";
      this.saveCtx.stroke();
      this.saveCtx.fill(); //填充
      this.saveCtx.restore();
    },

    savePoints() {
      // 将画布坐标数据转换成提交数据
      let objectPoints = [];
      // "object": [{"polygon": {"x1":700,"y1":273,"x2":975,"y2":278,"x3":1107,"y3":368,"x4":718,"y4":354} }]
      objectPoints = this.drawedPoints.map((area) => {
        let polygon = {};
        area.forEach((point, i) => {
          polygon[`x${i + 1}`] = Math.round(point[0] * this.ratio);
          polygon[`y${i + 1}`] = Math.round(point[1] * this.ratio);
        });
        return {
          polygon: polygon,
        };
      });
      this.submitData = objectPoints;
      console.log("最终提交数据", objectPoints);
    },
    renderDatas() {
      // 将提交数据数据转换成画布坐标
      this.drawedPoints = this.submitData.map((item) => {
        let polygon = item.polygon;
        let points = [];
        for (let i = 1; i < Object.keys(polygon).length / 2 + 1; i++) {
          if (!isNaN(polygon[`x${i}`]) && !isNaN(polygon[`y${i}`])) {
            points.push([
              polygon[`x${i}`] / this.ratio,
              polygon[`y${i}`] / this.ratio,
            ]);
          }
        }
        this.drawSaveArea(points);
        return points;
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.tool-box {
  width: 60vw;
  height: 40px;
  padding: 5px 30px;
  margin: 20px auto 0;
  box-sizing: border-box;
  text-align: right;
}
.canvas-wrap {
  // width: 80vw;
  // height: 45vw;
  width: 60vw;
  height: 33.75vw;
  margin: 0px auto;
  background-color: #000; //#fff;
  border: 3px;
  border-color: #333;
  position: relative;
}
#imgCanvas,
#drawCanvas,
#saveCanvas {
  background: rgba(255, 0, 255, 0);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
#drawCanvas {
  z-index: 2;
}
</style>
