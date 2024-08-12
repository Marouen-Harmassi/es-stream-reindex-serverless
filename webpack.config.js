const path = require("path");
const slsw = require("serverless-webpack");
const webpack = require("webpack");

module.exports = (async () => {
  const accountId = await slsw.lib.serverless.providers.aws.getAccountId();

  return {
    mode: slsw.lib.webpack.isLocal ? "development" : "production",
    entry: slsw.lib.entries,
    devtool: "source-map",
    resolve: {
      extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
      // Add support for TypeScripts fully qualified ESM imports.
      extensionAlias: {
        ".js": [".js", ".ts"],
        ".cjs": [".cjs", ".cts"],
        ".mjs": [".mjs", ".mts"],
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        AWS_ACCOUNT_ID: `${accountId}`,
      }),
    ],
    output: {
      libraryTarget: "commonjs2",
      path: path.join(__dirname, ".webpack"),
      filename: "[name].js",
    },
    target: "node18",
    module: {
      rules: [
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        {
          test: /\.(ts|tsx)$/,
          loader: "ts-loader",
          options: {
            compiler: "ttypescript",
          },
        },
      ],
    },
    externals: {},
    stats: "minimal",
  };
})();
