import {injectable} from 'inversify';
import {container} from './container';
import {env, envBool} from './function';
import {logger} from './logger';
import { Settings as LuxonSettings } from 'luxon';

export type ShutdownHook = () => void;

@injectable()
export class App {
    env: string = 'production';
    name: string = 'pine-app';
    debug: boolean = false;
    shutdownHook: ShutdownHook[] = [];

    async bootstrap() {
        this.addShutdownHook(logger.close);
        this.env = env('app_env');
        this.name = env('app_name');
        this.debug = envBool('app_debug', false);

		// set timezone
        const timezone = env('app_timezone');
		if(timezone){
		    process.env.TZ = timezone;
            LuxonSettings.defaultZone=timezone;
		}else{
            logger.warn('app_timezone is missing.');
        }

        const boot_message = `App[${this.name}] start with env=${this.env}, working_dir=` + process.cwd()
		logger.info(boot_message);
    }

	addShutdownHook(func: ShutdownHook){
		this.shutdownHook.push(func)
	}

	shutdown() {
		for(let func of this.shutdownHook) {
			try{
				func()
			}catch(e){
				//pass
			}
		}
        const len = this.shutdownHook.length
		logger.info(`App[${this.name}] shutdown with ${len} hook[s] processed.`);
	}
}

export const app = container.get(App);

