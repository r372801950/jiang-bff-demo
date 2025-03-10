const path = require('path');
const fs = require('fs');
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
// const TerserPlugin = require('terser-webpack-plugin');
const layerDependencies = [
  'awilix',
  'awilix-koa',
  'koa',
  'koa-router',
  'koa-static',
  'koa-swig',
  'koa2-connect-history-api-fallback',
  'lodash',
  'log4js',
  'module-alias',
  'serverless-http',
];
// 获取不同目录下的所有TS文件作为入口
const getDirectoryEntries = (directory) => {
  const entries = {};
  const dirPath = path.resolve(__dirname, directory);

  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      if (file.endsWith('.ts')) {
        const name = file.replace('.ts', '');
        entries[`${directory}/${name}`] = `./${directory}/${file}`;
      }
    });
  }

  return entries;
};
// 获取各个目录的入口点
const routerEntries = getDirectoryEntries('routers');
const serviceEntries = getDirectoryEntries('services');
const interfaceEntries = getDirectoryEntries('interface');
module.exports = {
  entry: {
    lambda: './lambda.ts',
    ...routerEntries, // 添加所有router文件作为入口点
    ...serviceEntries,
    ...interfaceEntries
  },
  target: 'node',
  mode: 'development',
  externals: [
    ({ request }, callback) => {
      if (layerDependencies.includes(request)) {//遇到layers直接过滤掉
        return callback(null, `commonjs ${request}`);
      }
      if (request === 'express') {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    },
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [
          /node_modules/,
          /\.spec\.ts$/,
          /\.e2e-spec\.ts$/,
          path.resolve(__dirname, 'test'),
          path.resolve(__dirname, 'src/**/*.spec.ts'),
        ],
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            experimentalWatchApi: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, '/'),
      '@config': path.resolve(__dirname, 'config'),
      '@middlewares': path.resolve(__dirname, 'middlewares'),
      '@routers': path.resolve(__dirname, 'routers'),
      '@interfaces': path.resolve(__dirname, 'interface')
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (pathData) => {
      // 入口文件固定命名
      return pathData.chunk.name === 'lambda' ? 'lambda.js' : '[name].js';
    },
    chunkFilename: '[name].[contenthash].js',
    clean: true,
    libraryTarget: 'commonjs2',
  },
  optimization: {
    minimize: false,
    runtimeChunk: false,
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      cacheGroups: {
        default: false,
        vendors: false,
        sources: {
          test: /\.ts$/,
          name(module) {
            if (module.resource.endsWith('lambda.ts')) {
              return false;
            }
            // const srcPath = path.relative(
            //   path.join(__dirname, 'src'),
            //   module.resource
            // );
            // 假设你的源代码在项目根目录下
            const rootPath = path.join(__dirname);
            const srcPath = path.relative(
              rootPath,
              module.resource
            );
            return srcPath.replace(/\.ts$/, ''); // 只替换 .ts 后缀为空

          },
          chunks: 'all',
          enforce: true,
          priority: 10,
        },
      },
    },
  },
  stats: {
    errorDetails: true,
    chunks: true,
    modules: true,
  },
  devtool: 'source-map',plugins: [
    new CleanWebpackPlugin(),
  ]
};
