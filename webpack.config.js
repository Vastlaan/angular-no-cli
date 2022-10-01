const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const AngularWebpackPlugin = require("@ngtools/webpack").AngularWebpackPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env) => ({
  mode: env.production ? "production" : "development",
  devtool: env.production ? false : "eval",
  context: path.resolve(__dirname),
  devServer: {
    static: {
      directory: path.resolve(__dirname, "dist"),
    },
    port: 3000,
    hot: true,
    open: false,
  },
  entry: {
    index: ["./src/main.ts"],
  },
  stats: "normal",
  output: {
    clean: true,
    path: path.resolve(__dirname, "dist"),
    filename: env.production ? "[name].[chunkhash].js" : "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.[cm]?[tj]sx?$/,
        exclude: /\/node_modules\//,
        use: [
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              compact: false,
              plugins: ["@angular/compiler-cli/linker/babel"],
            },
          },
          {
            loader: "@angular-devkit/build-angular/src/babel/webpack-loader",
            options: {
              aot: true,
              optimize: true,
              scriptTarget: 7,
            },
          },
          {
            loader: "@ngtools/webpack",
          },
        ],
      },
      {
        test: /\.?(svg|html)$/,
        resourceQuery: /\?ngResource/,
        type: "asset/source",
      },
      {
        test: /\.(s[ac]ss|css)$/i,
        exclude: /\/node_modules\//,
        oneOf: [
          {
            resourceQuery: {
              not: [/\?ngResource/],
            },
            // use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
            use: [
              MiniCssExtractPlugin.loader,
              "css-loader",
              "postcss-loader",
              "sass-loader",
            ],
          },
          {
            type: "asset/source",
            use: [
              MiniCssExtractPlugin.loader,
              "css-loader",
              "postcss-loader",
              "sass-loader",
            ], // this works: use: ["sass-loader"] or use: ["postcss-loader", "sass-loader"]
          },
        ],
      },
    ],
  },
  // will generate runtime.js  module loading functions
  optimization: {
    minimize: true,
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
      maxAsyncRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const name = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `${name.replace("@", "")}`;
          },
        },
      },
    },
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "src", "index.html"),
    }),
    new AngularWebpackPlugin({
      tsconfig: path.resolve(__dirname, "tsconfig.json"),
      jitMode: true,
      directTemplateLoading: true,
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new CopyPlugin({
      patterns: [
        {
          context: "src/assets/",
          from: "**/*",
          to: "assets/",
        },
      ],
    }),
  ],
});
