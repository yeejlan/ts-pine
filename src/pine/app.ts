import {env, throwError} from './function';
import {PineException} from './exception';

export class App {
    env: string;
    name: string;
    isInit = false;

    constructor() {
        this.env = env('app_env');
        this.name = env('app_name');
    }

    async init() {
		// set timezone
		if(!env('app_timezone')){
			throwError(PineException.name, 'app_timezone not found.');
		}
		process.env.TZ = env('app_timezone');

		// log.info(`App[${this.name}] starting with env=${this.env}, working_dir = ` + process.cwd());
		this.isInit = true;
    }

}