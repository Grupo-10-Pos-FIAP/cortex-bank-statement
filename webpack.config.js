const { merge } = require("webpack-merge");
const path = require("path");
const webpack = require("webpack");
const singleSpaDefaults = require("webpack-config-single-spa-react-ts");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "cortex-bank",
    projectName: "statement",
    webpackConfigEnv,
    argv,
  });

  const PORT = 3004;

  // Simplificado seguindo padrão do auth
  // O webpack-config-single-spa-react-ts já lida com modo standalone automaticamente
  return merge(defaultConfig, {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    devServer: {
      port: PORT,
      hot: true,
      host: "0.0.0.0",
      allowedHosts: "all",
      watchFiles: ["src/**", "public/**"],
      client: {
        webSocketURL: {
          protocol: "ws",
          hostname: "localhost",
          port: PORT,
        },
      },
    },
    watchOptions: {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: /node_modules/,
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.API_BASE_URL": JSON.stringify(
          process.env.API_BASE_URL || "http://localhost:8080"
        ),
        "process.env.USE_MOCK": JSON.stringify(process.env.USE_MOCK || ""),
        "process.env.MOCK_API_BASE_URL": JSON.stringify(
          process.env.MOCK_API_BASE_URL || "http://localhost:8080"
        ),
        "process.env.NODE_ENV": JSON.stringify(
          process.env.NODE_ENV || webpackConfigEnv.mode || "development"
        ),
      }),
    ],
  });
};
