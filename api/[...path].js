module.exports = async function handler(req, res) {
  const { app } = await import("../server/src/app.js");
  return app(req, res);
};
