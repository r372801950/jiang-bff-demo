import { addAliases } from 'module-alias';
addAliases({
  '@root': __dirname,
  '@interfaces': `${__dirname}/interface`,
  '@config': `${__dirname}/config`,
  '@middlewares': `${__dirname}/middlewares`,
  '@routers': `${__dirname}/routers`,
});
import Koa from 'koa';
import config from '@config/index';
import render from 'koa-swig';
import serve from 'koa-static';
import co from 'co';
import { createContainer, Lifetime } from 'awilix';
import { loadControllers, scopePerRequest } from 'awilix-koa';
import ErrorHandler from '@middlewares/ErrorHandler';
import { configure, getLogger } from 'log4js';
//koa中没有实现的路由重定向到index.html
import { historyApiFallback } from 'koa2-connect-history-api-fallback';
// import 'dotenv/config.js'

// 修改这一行
const ext = process.env.NODE_ENV === 'production' ? 'js' : 'js';

//日志系统
configure({
  // appenders: { cheese: { type: 'file', filename: `${__dirname}/logs/yd.log` } },//log4js这个代笔没有logs的权限
  appenders: { cheese: { type: 'file', filename: `/tmp/logs/yd.log` } },
  categories: { default: { appenders: ['cheese'], level: 'error' } },
});
// 在app.ts中修改log4js配置
// configure({
//   appenders: {
//     console: { type: 'console' },  // 添加控制台输出
//     cheese: {
//       type: 'file',
//       filename: process.env.NODE_ENV === 'production'
//         ? '/tmp/logs/yd.log'  // 在Lambda中使用/tmp
//         : `${__dirname}/tmp/logs/yd.log`
//     }
//   },
//   categories: {
//     default: {
//       appenders: ['console', 'cheese'],  // 同时输出到控制台和文件
//       level: 'error'
//     }
//   },
// });
const app = new Koa();
const logger = getLogger('cheese');
const { viewDir, memoryFlag, staticDir } = config;

app.context.render = co.wrap(
  render({
    root: viewDir,
    autoescape: true,
    cache: <'memory' | false>memoryFlag,
    writeBody: false,
    ext: 'html',
  })
);
//静态资源生效节点
app.use(serve(staticDir));
//创建IOC的容器
const container = createContainer();
//所有的可以被注入的代码都在container中
container.loadModules([`${__dirname}/services/*.${ext}`], {
// container.loadModules([`/services/*.${ext}`], {
  formatName: 'camelCase',
  resolverOptions: {
    lifetime: Lifetime.SCOPED,
  },
});

//每一次用户请求router中 都会从容器中取到注入的服务
app.use(scopePerRequest(container));

ErrorHandler.error(app, logger);
app.use(historyApiFallback({ index: '/', whiteList: ['/api'] }));
//让所有的路由全部生效
app.use(loadControllers(`${__dirname}/routers/*.${ext}`));
// app.use(loadControllers(`@routers/*.${ext}`));
/*if (process.env.NODE_ENV === 'development') {
  app.listen(port, () => {
    console.log('京程一灯Server BFF启动成功');
  });
}*/
export default app;
