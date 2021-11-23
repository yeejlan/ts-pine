import {env, envBool} from '../pine';
import {injectable} from 'inversify';
import {BaseController} from './base.controller';

@injectable()
export class HomeController extends BaseController {
    indexAction(): any {
        let msg = 'welcome to '+env('app_name');
        let envStr = `<!--timezone = ${env('app_timezone')}, debug = ${envBool('app_debug')}-->`;
        return msg+envStr;
    }
}