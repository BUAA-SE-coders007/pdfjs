/* Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @typedef {import("./interfaces").IDownloadManager} IDownloadManager */

import { createValidAbsoluteUrl, isPdfFile } from "pdfjs-lib";
import axios from 'axios';

if (typeof PDFJSDev !== "undefined" && !PDFJSDev.test("CHROME || GENERIC")) {
  throw new Error(
    'Module "pdfjs-web/download_manager" shall not be used ' +
      "outside CHROME and GENERIC builds."
  );
}

function download(blobUrl, filename) {
  const a = document.createElement("a");
  if (!a.click) {
    throw new Error('DownloadManager: "a.click()" is not supported.');
  }
  a.href = blobUrl;
  a.target = "_parent";
  // Use a.download if available. This increases the likelihood that
  // the file is downloaded instead of opened by another PDF plugin.
  if ("download" in a) {
    a.download = filename;
  }
  // <a> must be in the document for recent Firefox versions,
  // otherwise .click() is ignored.
  (document.body || document.documentElement).append(a);
  a.click();
  a.remove();
}

/**
 * @implements {IDownloadManager}
 */
class DownloadManager {
  #openBlobUrls = new WeakMap();

  downloadData(data, filename, contentType) {
    const blobUrl = URL.createObjectURL(
      new Blob([data], { type: contentType })
    );
    download(blobUrl, filename);
  }

  /**
   * @returns {boolean} Indicating if the data was opened.
   */
  openOrDownloadData(data, filename, dest = null) {
    const isPdfData = isPdfFile(filename);
    const contentType = isPdfData ? "application/pdf" : "";

    if (
      (typeof PDFJSDev === "undefined" || !PDFJSDev.test("COMPONENTS")) &&
      isPdfData
    ) {
      let blobUrl = this.#openBlobUrls.get(data);
      if (!blobUrl) {
        blobUrl = URL.createObjectURL(new Blob([data], { type: contentType }));
        this.#openBlobUrls.set(data, blobUrl);
      }
      let viewerUrl;
      if (typeof PDFJSDev === "undefined" || PDFJSDev.test("GENERIC")) {
        // The current URL is the viewer, let's use it and append the file.
        viewerUrl = "?file=" + encodeURIComponent(blobUrl + "#" + filename);
      } else if (PDFJSDev.test("CHROME")) {
        // In the Chrome extension, the URL is rewritten using the history API
        // in viewer.js, so an absolute URL must be generated.
        viewerUrl =
          // eslint-disable-next-line no-undef
          chrome.runtime.getURL("/content/web/viewer.html") +
          "?file=" +
          encodeURIComponent(blobUrl + "#" + filename);
      }
      if (dest) {
        viewerUrl += `#${escape(dest)}`;
      }

      try {
        window.open(viewerUrl);
        return true;
      } catch (ex) {
        console.error("openOrDownloadData:", ex);
        // Release the `blobUrl`, since opening it failed, and fallback to
        // downloading the PDF file.
        URL.revokeObjectURL(blobUrl);
        this.#openBlobUrls.delete(data);
      }
    }

    this.downloadData(data, filename, contentType);
    return false;
  }

   download(data, url, filename, message) {
   if (!data) {
     console.error("No data provided for upload.");
     return;
   }

   const blob = new Blob([data], { type: 'application/octet-stream' });   
   const pdf_file = new FormData();
   pdf_file.append("article", blob);
   pdf_file.append("article_id", message.articleId);

   fetch("https://jienote.top/article/annotateSelfArticle?article_id=" + message.articleId, {
     method: "POST",
     headers: {
       Authorization:'Bearer ' + message.token,
     },
     body: pdf_file,
   })
     .then((response) => {
       if (!response.ok) {
         throw new Error("Upload failed");
       }
       return response.json();
     })
     .then((result) => {
       window.parent.postMessage(
         {
           type: "save-success",
           result,
         },
         "*"
       );
     })
     .catch((error) => {
       console.error("Upload error:", error);
       window.parent.postMessage(
         {
           type: "save-fail",
           err: error
         },
         "*"
       );
     });
   }

 /*async download(data, url, filename, message){
    if (!data) {
      console.error("No data provided for upload.");
      return;
    }

    const pdf_file = new FormData();
    pdf_file.append("article", data);
    const ret = await axios.post(
      `https://jienote.top/article/annotateSelfArticle?article_id=${message.articleId}`,
      pdf_file,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
  };*/

}

export { DownloadManager };