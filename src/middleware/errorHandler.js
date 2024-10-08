import Sentry from "@sentry/node";

// Initialize Sentry only if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

const errorHandler = (err, req, res, next) => {
  // Log error to Sentry if initialized
  if (Sentry.captureException) {
    Sentry.captureException(err);
  }

  console.error(err.stack);

  res.status(500).json({
    error: "An error occurred on the server, please double-check your request!",
  });
};

export default errorHandler;
