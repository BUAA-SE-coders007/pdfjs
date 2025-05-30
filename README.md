# JieNote PDF JS 魔改版

本仓库是JieNote团队基于Mozilla的pdfjs库进行魔改的pdfjs版本，主要进行了以下工作：
* 汉化
* 针对JieNote前端项目的一些适配
* 字体

> 注意：需要在编译好的文件中的viewer.html中加入部分script 用来进行通信
> ```
>   <script>
>    window.addEventListener('message', function(event) {
>      console.log('收到消息:', event.data);
>      if (event.data.type === 'save') {
>        if (window.PDFViewerApplication) {
>          window.PDFViewerApplication.download(event.data);
>        } else {
>          window.parent.postMessage(
>          {
>            type: "save-fail",
>            err: 'PDFViewerApplication is not initialized'
>          },
>          "*");
>        }
>      }
>      // 这里你可以调用 PDF.js viewer API，比如切换页码等
>    });
>  </script>
>
