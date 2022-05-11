const userRouter = require("./user");
// const productRouter = require("./product");
// const orderRouter = require("./order");

function route(app) {
  app.use("/user", userRouter);
  // app.use("/api/products", productRouter);
  // app.use("/api/orders", orderRouter);

  app.use((req, res) => {
    res.redirect("/error");
  });

  app.use((err, req, res, next) => {
    console.log(err.message);
  });
}

module.exports = route;
