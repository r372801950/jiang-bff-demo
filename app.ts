import { addAliases } from 'module-alias';
addAliases({
  '@root': __dirname,
  '@interfaces': `${__dirname}/interface`,
  '@config': `${__dirname}/config`,
  '@middlewares': `${__dirname}/middlewares`,
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

//日志系统
configure({
  appenders: { cheese: { type: 'file', filename: `${__dirname}/logs/yd.log` } },
  categories: { default: { appenders: ['cheese'], level: 'error' } },
});
const app = new Koa();
const logger = getLogger('cheese');
const { port, viewDir, memoryFlag, staticDir } = config;

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
container.loadModules([`${__dirname}/services/*.ts`], {
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
app.use(loadControllers(`${__dirname}/routers/*.ts`));
if (process.env.NODE_ENV === 'development') {
  app.listen(port, () => {
    console.log('京程一灯Server BFF启动成功');
  });
}
export default app;
