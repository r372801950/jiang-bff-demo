import { GET, route } from 'awilix-koa';
import { Context } from '@interfaces/IKoa';

@route('/')
class IndexController {
  @GET()
  async actionList(ctx: Context): Promise<void> {
    // 从环境变量获取 S3 基础 URL
    const s3BaseUrl = process.env.S3_BASE_URL || '';
    console.log('Using S3 base URL:', s3BaseUrl);
    //react vue ...html字符串 diff
    const data = await ctx.render('index', {
      data: '服务端数据',
      s3BaseUrl: s3BaseUrl
    });
    console.log('🍊🍊🍊🍊🍊🍊🍊 ', data);

    ctx.body = data;
  }
}
export default IndexController;
