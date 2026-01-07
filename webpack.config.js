/* eslint-disable */
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

  // Modo standalone: desenvolvimento local sem Module Federation
  if (webpackConfigEnv.standalone) {
    const {
      library: _library,
      libraryTarget: _libraryTarget,
      libraryExport: _libraryExport,
      libraryType: _libraryType,
      ...outputWithoutLibrary
    } = defaultConfig.output || {};
    const { outputModule: _outputModule, ...experimentsWithoutModule } =
      defaultConfig.experiments || {};
    const { externals: _externals, ...configWithoutExternals } = defaultConfig;

    const finalPlugins =
      configWithoutExternals.plugins?.filter((plugin) => {
        const name = plugin.constructor.name;
        return (
          name !== "ModuleFederationPlugin" &&
          name !== "StandaloneSingleSpaPlugin" &&
          name !== "HtmlWebpackPlugin"
        );
      }) || [];

    return {
      ...configWithoutExternals,
      entry: {
        "cortex-bank-statement": require.resolve("./src/standalone.tsx"),
      },
      output: {
        ...outputWithoutLibrary,
        filename: "cortex-bank-statement.js",
      },
      experiments: experimentsWithoutModule,
      externals: undefined,
      resolve: {
        ...configWithoutExternals.resolve,
        alias: {
          ...configWithoutExternals.resolve?.alias,
          "@": path.resolve(__dirname, "src"),
        },
      },
      devServer: {
        ...configWithoutExternals.devServer,
        static: {
          directory: path.join(__dirname, "public"),
        },
        historyApiFallback: {
          index: "/standalone.html",
          disableDotRule: true,
        },
        open: "/standalone.html",
      },
      plugins: [
        ...finalPlugins,
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
    };
  }

  // Modo federado (padrão): usar configuração do single-spa sem modificações
  return merge(defaultConfig, {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  });
};
