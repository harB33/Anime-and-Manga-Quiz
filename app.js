require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const phpBin = fs.existsSync("C:\\xampp\\php\\php.exe")
  ? "C:\\xampp\\php\\php.exe"
  : "php";
const phpExpress = require("php-express")({ binPath: phpBin });
const quizRoutes = require("./routes/quiz");
const pagesRoutes = require("./routes/pages");

const app = express();
const PORT = process.env.PORT || 3000;

// Set default local variables
app.locals.user = null;

// Set up PHP support for .php routes and keep EJS views as well
app.engine("php", phpExpress.engine);
app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views"),
  path.join(__dirname, "public"),
]);

// Middleware
app.use(morgan("combined"));
app.use(
  helmet({
    contentSecurityPolicy: true,
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing middleware for auth bridge
app.use((req, res, next) => {
  const cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const value = parts.slice(1).join("=").trim();
        cookies[name] = value;
      }
    });
  }
  // Set user object in locals for all templates
  res.locals.user = cookies.username
    ? { username: decodeURIComponent(cookies.username) }
    : null;
  res.locals.query = req.query;
  next();
});

// Custom PHP middleware to handle Windows spawn and stdin properly
const handlePHP = (req, res, next) => {
  const filePath = path.join(__dirname, "public", req.path);
  if (!fs.existsSync(filePath)) {
    return next();
  }

  const querystring = require("querystring");
  const { spawn } = require("child_process");

  const runnerPath = path.join(__dirname, "public", "php", "custom_runner.php");
  const getQuery = querystring.stringify(req.query);
  const postBody =
    req.method === "POST"
      ? req.headers["content-type"] &&
        req.headers["content-type"].includes("application/json")
        ? JSON.stringify(req.body)
        : querystring.stringify(req.body)
      : "";

  const env = {
    ...process.env,
    REQUEST_METHOD: req.method,
    CONTENT_LENGTH: Buffer.byteLength(postBody),
    CONTENT_TYPE:
      req.headers["content-type"] || "application/x-www-form-urlencoded",
    HTTP_COOKIE: req.get("Cookie") || "",
    QUERY_STRING: getQuery,
  };

  const phpProcess = spawn(
    phpBin,
    [runnerPath, path.dirname(filePath), filePath],
    { env },
  );

  let stdout = "";
  let stderr = "";

  if (postBody) {
    phpProcess.stdin.write(postBody);
    phpProcess.stdin.end();
  }

  phpProcess.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  phpProcess.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  phpProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`PHP process exited with code ${code}. Stderr: ${stderr}`);
      return res
        .status(500)
        .send(stderr || `PHP process failed with code ${code}`);
    }

    // Parse special headers from PHP output using a global regex
    const headerRegex = /X-Express-Header:\s*([\w-]+):\s*([^\r\n]+)/gi;
    let redirectUrl = null;
    let match;

    // Extract all headers
    while ((match = headerRegex.exec(stdout)) !== null) {
      const name = match[1].trim();
      const value = match[2].trim();

      if (name.toLowerCase() === "location") {
        redirectUrl = value;
      } else {
        res.append(name, value);
      }
    }

    // Clean up the output by removing all header lines
    const cleanStdout = stdout
      .replace(/X-Express-Header:\s*[\w-]+:\s*[^\r\n]+/gi, "")
      .trim();

    if (redirectUrl) {
      return res.redirect(redirectUrl);
    }

    res.send(cleanStdout);
  });
};

app.all(/.+\.php$/, handlePHP);
app.use(express.static("public"));

// Routes
app.use("/api/quiz", quizRoutes);
app.use("/", pagesRoutes);

// Error handling middleware
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .send(`Error ${err.status || 500}: ${err.message}`);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
