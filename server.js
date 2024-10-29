const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url);
  const extname = path.extname(filePath);
  let contentType = "text/html";

  switch (extname) {
    case ".css":
      contentType = "text/css";
      break;
    case ".js":
      contentType = "application/javascript";
      break;
    case ".html":
      contentType = "text/html";
      break;
    case ".ico":
      contentType = "image/x-icon";
      break;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 - File Not Found");
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("500 - Internal Server Error");
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
