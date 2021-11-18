
export class App {
    env: string;
    name: string;
    isInit = false;

    constructor() {
        this.env = env('app_env');
        this.name = env('app_name');
    }

    async init() {
		//set timezone
		if(!env('app_timezone')){
			log.error('Please set "app_timezone" in env file');
			process.exit(1);
		}
		process.env.TZ = this._config.timezone;
    }

}