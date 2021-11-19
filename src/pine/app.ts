import {env, throwError} from './function';
import {PineError} from './exception';
import {Logger} from './logger';
import { Settings as LuxonSettings } from 'luxon';

export class PineApp {
    env: string = 'production';
    name: string = 'pine-app';
    logger!: Logger;
    isInit = false;

    async bootstrap() {
        this.logger = Logger();
        this.env = env('app_env');
        this.name = env('app_name');

		// set timezone
        const timezone = env('app_timezone');
		if(timezone){
		    process.env.TZ = timezone;
            LuxonSettings.defaultZone=timezone;
		}else{
            this.logger.warn('app_timezone is missing.');
        }

        const boot_message = `App[${this.name}] starting with env=${this.env}, working_dir=` + process.cwd()
		this.logger.info(boot_message);
		this.isInit = true;
    }

}

const app = new PineApp();

export function App() {
    return app;
}