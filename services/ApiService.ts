import { IApi } from '@interfaces/IApi';
import { IData } from '@interfaces/IData';

class ApiService implements IApi {
  getInfo() {
    //区别开 MPA 和 SPA
    // window.localStorage.get('info');
    // if(){}..
    return new Promise<IData>((resolve) => {
      resolve({
        item: '我是后台数据🌺',
        result: [1, 'next'],
      });
    });
  }
}
export default ApiService;
