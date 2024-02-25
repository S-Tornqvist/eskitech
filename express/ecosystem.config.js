module.exports = {
  apps : [{
    name   : "@eskitech/express",
    script : "./build/server.js",
    env: {
      NODE_ENV: "production",
      PRODUCTS_CSV: "products.csv",
      STATIC_PATH: "public/"
    },
  }]
}
