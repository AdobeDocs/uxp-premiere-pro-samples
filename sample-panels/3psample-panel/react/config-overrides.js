const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = function override(config, env) {
  if (!config.externals) {
    config.externals = {};
  }

  config.externals = {
    ...config.externals,
    uxp: "commonjs2 uxp",
    fs: "commonjs2 fs",
    premierepro: "commonjs2 premierepro",
  };

  config.resolve.fallback = {
    crypto: require.resolve("crypto-browserify"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    path: require.resolve("path-browserify"),
    zlib: require.resolve("browserify-zlib"),
    os: require.resolve("os-browserify/browser"),
    stream: require.resolve("stream-browserify"),
  };

  if (process.env.CI) {
    config.devtool = false;
  } else {
    config.devtool = "eval-source-map";
    config.plugins.push(
      new NodePolyfillPlugin({
        excludeAliases: [
          "assert",
          "console",
          "constants",
          "crypto",
          "domain",
          "events",
          "http",
          "https",
          "os",
          "path",
          "punycode",
          "querystring",
          "_stream_duplex",
          "_stream_passthrough",
          "_stream_transform",
          "_stream_writable",
          "string_decoder",
          "sys",
          "timers",
          "tty",
          "url",
          "util",
          "vm",
          "zlib",
        ],
      })
    );
  }

  // update naming rules for js files
  config.output.filename = "static/js/[name].js";

  // update the rules for assets
  config.module.rules.forEach((rule) => {
    rule?.oneOf?.forEach((one) => {
      if (one?.test?.source?.indexOf(".svg$") > 0) {
        one?.use?.forEach((use) => {
          if (use.options?.name === "static/media/[name].[hash].[ext]") {
            use.options.name = "static/media/[name].[ext]";
          }
        });
      }
    });
  });

  // remove webpack because it requires the precache-manifest.js file to contain the hash
  config.plugins = config.plugins.filter(
    (plugin) => plugin.constructor.name !== "GenerateSW"
  );

  // update settings for the css plugin
  config.plugins = config.plugins.map((plugin) => {
    if (plugin.constructor.name === "MiniCssExtractPlugin") {
      plugin.options.filename = "static/css/[name].css";
    }

    return plugin;
  });

  // disable chunking
  config.optimization.splitChunks = { cacheGroups: { default: false } };
  config.optimization.runtimeChunk = false;

  config.plugins.push(
    new webpack.DefinePlugin({
      "process.env.SCALE_MEDIUM": "true",
      "process.env.SCALE_LARGE": "false",
      "process.env.THEME_LIGHT": "true",
      "process.env.THEME_LIGHTEST": "false",
      "process.env.THEME_DARK": "true",
      "process.env.THEME_DARKEST": "true",
    })
  );
  return config;
};
