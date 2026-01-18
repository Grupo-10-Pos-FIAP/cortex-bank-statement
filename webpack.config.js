const { mergeWithCustomize, customizeArray } = require("webpack-merge");
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

  // Detecta a porta do argumento --port, process.env.PORT ou usa a padrão
  // O webpack-cli passa --port como string, então precisamos converter
  const PORT = argv.port 
    ? parseInt(argv.port, 10) 
    : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3004);

  return mergeWithCustomize({
    customizeArray: customizeArray({
      plugins: (basePlugins, newPlugins) => {
        const filteredBasePlugins = basePlugins.filter(
          (plugin) => !(plugin instanceof webpack.DefinePlugin)
        );
        return [...filteredBasePlugins, ...newPlugins];
      },
    }),
  })(defaultConfig, {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    devServer: {
      // A porta pode ser sobrescrita por --port na linha de comando
      // O webpack-dev-server dá prioridade ao --port sobre esta configuração
      port: PORT,
      hot: true,
      host: "0.0.0.0",
      allowedHosts: "all",
      watchFiles: ["src/**", "public/**"],
      // Não especifica webSocketURL - o webpack-dev-server usa automaticamente
      // a mesma porta do servidor quando não especificado
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
