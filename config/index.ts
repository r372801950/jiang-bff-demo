import _ from 'lodash';
import { join } from 'path';

// 检测是否在 Lambda 环境中
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
let config = {
  viewDir: join(__dirname, '..', 'views'),
  staticDir: join(__dirname, '..', 'assets'),
  memoryFlag: false,
  s3BaseUrl: process.env.S3_BASE_URL || ''  // 从环境变量获取
};

if (process.env.NODE_ENV === 'development') {
  let localConfig = {
    port: 8081,  // 仅在本地开发时使用
  };
  config = _.assignIn(config, localConfig);
}

if (process.env.NODE_ENV === 'production') {
  let prodConfig = {
    memoryFlag: 'memory',
  };
  config = _.assignIn(config, prodConfig);
}

// 如果是 Lambda 环境，确保视图目录路径正确
if (isLambda) {
  console.log('Running in Lambda environment');
  // Lambda 环境中，目录结构可能不同
  config.viewDir = join(__dirname, '..', 'views');
}

console.log('Config:', config);
console.log('View directory:', config.viewDir);

export default config;

// let config = {
//   viewDir: join(__dirname, '..', 'views'),
//   staticDir: join(__dirname, '..', 'assets'),
//   port: 8081,
//   memoryFlag: false,
// };
// if (process.env.NODE_ENV === 'development') {
//   let localConfig = {
//     port: 8081,
//   };
//   config = _.assignIn(config, localConfig);
// }
// if (process.env.NODE_ENV === 'production') {
//   let prodConfig = {
//     port: 8082,
//     memoryFlag: 'memory',
//   };
//   config = _.assignIn(config, prodConfig);
// }
//
// export default config;
