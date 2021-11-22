import {env, envBool} from '../pine/functions';
import {injectable} from 'inversify';

@injectable()
export class HomeController {

    indexAction() {
        let msg = 'welcome to '+env('app_name');
        let envStr = `<!--timezone = ${env('app_timezone')}, debug = ${envBool('app_debug')}-->`;
        return msg+envStr;
    }
}