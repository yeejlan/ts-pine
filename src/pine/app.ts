import {injectable} from 'inversify';
import {container} from './container';
import {env, envBool} from './functions';
import {Logger, ConsoleLogger} from './logger';
import { Settings as LuxonSettings } from 'luxon';
import {ResourceManager} from './resource_manager';
import {c_session_enable, c_redis_registry_key, c_session_storage_registry_key} from './session';

export type ShutdownHook = () => void;

@injectable()
export class App {
    env: string = 'production';
    name: string = 'pine-app';
    debug: boolean = false;
    shutdownHook: ShutdownHook[] = [];
    storage: Map<string, any> = new Map;
    logger: Logger;

    constructor() {
        this.logger = container.get<Logger>(ConsoleLogger);
    }

    async bootstrap() {
        this.logger.open();
        this.addShutdownHook(this.logger.close);
        this.env = env('app_env');
        this.name = env('app_name');
        this.debug = envBool('app_debug', false);

        // set timezone
        const timezone = env('app_timezone');
        if(timezone){
            process.env.TZ = timezone;
            LuxonSettings.defaultZone=timezone;
        }else{
            this.logger.warn('app_timezone is missing.');
        }

        // load redis and session storage
        if(c_session_enable){
            const rm = new ResourceManager();
            const redis = rm.newRedis('redis');
            this.set(c_redis_registry_key, redis);
            const sessionStorage = rm.newSessionStorage();
            this.set(c_session_storage_registry_key, sessionStorage);
        }


        const boot_message = `${this.name} start with env=${this.env}, working_dir=` + process.cwd()
        this.logger.info(boot_message);
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
        this.logger.info(`${this.name} shutdown with ${len} hook[s] processed.`);
    }

    set(key: string, value: any){
        this.storage.set(key, value);
    }

    get(key: string): any {
        return this.storage.get(key);
    }
}

export const app = container.get(App);

