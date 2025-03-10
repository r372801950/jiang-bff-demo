部署aws serverless
1. 新建lambda.ts,作为主入口的文件
2. template.yaml
3. aws configure(在系统上配置 AWS 凭证)
4. 这个是koa应用，app里面调用router和service，但是这两个玩意都没有打包到webpack的独立文件夹
   container.loadModules([`${__dirname}/services/*.${ext}`]
   app.use(loadControllers(`${__dirname}/routers/*.${ext}`));
   所以要在webpack手动配置，我也不知道我这个方案是不是很蠢
   获取不同目录下的所有TS文件作为入口，webpack.config.js里面看
5. 还有一个坑，是logs的，它似乎只能写死/tmp/logs/yd.log，能不能改我也不知道
6. 还有一个s3 bucket的配置，因为这是个koa+前端dist拖拽过来的项目，所以前端静态要放在s3，还要做CloudFront分发
6. 首先，构建应用:
   npx webpack(dist只有webpack才会生成，sam build 压根不吊dist)
   sam build
   这个命令会根据 template.yaml 文件构建所需的资源。
   然后，部署应用:
   sam deploy --guided
   --guided 参数会引导您完成部署配置，包括堆栈名称、AWS 区域、确认更改等。如果您已经部署过并有一个保存的配置，可以直接使用:
   sam deploy

   如果您想在本地测试:
   老师：sam local start-api --warm-containers EAGER
   sam local start-api
   这会在本地启动 API Gateway 模拟器，让您可以测试您的 API。
   查看部署信息:
   sam list resources --stack-name <你的堆栈名称>
   
   查看日志:
   sam logs --name NestjsFunction --stack-name <你的堆栈名称> --tail
7. 
5. apiGateway  路由的分发；跨域配置；上传文件请求头设置
6. VPC 虚拟私有云；数据库相关，必须项目的VPC和数据库的VPC设置在一个VPC里，不然访问特别慢；跨VPC访问代价特别大