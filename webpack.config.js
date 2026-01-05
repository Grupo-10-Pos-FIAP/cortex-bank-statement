const { merge } = require("webpack-merge");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
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
    const { library, libraryTarget, libraryExport, libraryType, ...outputWithoutLibrary } =
      defaultConfig.output || {};
    const { outputModule, ...experimentsWithoutModule } = defaultConfig.experiments || {};
    const { externals: _externals, ...configWithoutExternals } = defaultConfig;

    // Remover plugins de Module Federation, StandaloneSingleSpaPlugin e HtmlWebpackPlugin
    const finalPlugins =
      configWithoutExternals.plugins?.filter((plugin) => {
        const name = plugin.constructor.name;
        return (
          name !== "ModuleFederationPlugin" &&
          name !== "StandaloneSingleSpaPlugin" &&
          name !== "HtmlWebpackPlugin"
        );
      }) || [];

    // Construir configuração standalone substituindo completamente output, experiments e externals
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
        // DefinePlugin: substitui process.env por valores estáticos no bundle
        new webpack.DefinePlugin({
          "process.env.API_BASE_URL": JSON.stringify(
            process.env.API_BASE_URL || "http://localhost:8080"
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
