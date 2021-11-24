import {env, envBool} from '../../pine';
import {HomeController} from '../../controller/home.controller';
import {injectable} from 'inversify';

@injectable()
export class MyHomeController extends HomeController{

    indexAction() {
        let msg = 'welcome to '+env('app_name');
        let envStr = ` timezone = ${env('app_timezone')}, debug = ${envBool('app_debug')}`;
        return this.success(msg+envStr);
    }

    echoAction() {
        return this.success({
            method: this.ctx.request.method,
            params: this.ctx.params,
            a: this.ctx.params.a || true,
        });
    }
}