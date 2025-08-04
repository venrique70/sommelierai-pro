
const { onRequest } = require("firebase-functions/v2/https");
const { default: next } = require("next");
const { setGlobalOptions } = require("firebase-functions/v2");

const isDev = process.env.NODE_ENV !== "production";

// setGlobalOptions({ region: "us-central1" });

const server = next({
  dev: isDev,
  // locate the compiled Next.js files in the .next directory
  conf: { distDir: ".next" },
});

const nextjsHandle = server.getRequestHandler();

exports.server = onRequest(
  {
    // us-central1 is the default region for functions
    // but we can specify other regions to be closer to our users
    // region: "us-west1",
    // set the maximum number of instances to 10
    // to prevent fees from spiraling out of control
    maxInstances: 10,
  },
  (req, res) => {
    return server.prepare().then(() => nextjsHandle(req, res));
  }
);
