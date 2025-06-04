# JieNote PDF JS 魔改版

本仓库是JieNote团队基于Mozilla的pdfjs库进行魔改的pdfjs版本，主要进行了以下工作：
* 汉化
* 针对JieNote前端项目的一些适配
* 字体

> 注意：需要在编译好的文件中的viewer.html中加入部分script 用来进行通信 可见/web/viewer.html
```
<script >
    
      window.addEventListener('message', (event) => {

        if (event.origin !== "https://jienote.top") {
          return;
        }
        if (event.data.type === 'save') {
          if (window.PDFViewerApplication) {
            window.PDFViewerApplication.download(event.data);
          } else {
            window.parent.postMessage(
              { type: "save-fail", err: "PDFViewerApplication 未初始化" },
              "https://jienote.top" // 必须和发送方一致
            );
          }
        }
      });
    </script>
```
