import {RedisClient} from 'redis'
import {app} from './app'
import { env, envNumber } from './functions';
import {promisify} from 'util';
import {SessionStorage} from './session';

export class RedisSessionStorage implements SessionStorage {
    logger = app.logger;
    sessionExpire = envNumber('session_expire_seconds', 3600);
    storageProvider = env('session_storage_provider')
    protected storageEnable: boolean = false;
    protected redis: RedisClient;
    protected getAsync!: (key: string) => Promise<string|null>;
    constructor() {
        this.redis = app.get(this.storageProvider);
        this.storageEnable = true;
        if(!this.redis) {
            this.logger.warn("Can not found session storage provider: %s.", this.storageProvider);
            this.storageEnable = false;
            return;
        }

        this.getAsync = promisify(this.redis.get).bind(this.redis);	
    }

    async load(sessionId: string) {
        if(!this.storageEnable){
            return '';
        }
        return await this.getAsync(sessionId) ?? '';
    }

    async save(sessionId: string, data: string): Promise<void> {
        if(!this.storageEnable){
            return new Promise((resolve, _) => {
                resolve();
            });
        }
        let expireSeconds = this.sessionExpire;
        return new Promise((resolve, _) => {
            this.redis.set(sessionId, data, 'EX', expireSeconds, (err, _) => {
                if(err){
                    this.logger.error(RedisSessionStorage.name + ' save error:' + String(err));
                }
                resolve();
            });
        });
    }
}
