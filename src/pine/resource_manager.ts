import {env, envNumber} from './functions';
import {app} from './app';
import {ClientOpts, createClient, RedisClient} from 'redis'
import {SessionStorage} from './session';
import {RedisSessionStorage} from './session_storage_redis';

const c_session_storage = env('session_storage', 'redis');

export class ResourceManager {
    logger = app.logger;

    newSessionStorage(): SessionStorage|null {
        let storageSupported = ['redis'];
        if(storageSupported.indexOf(c_session_storage) > -1) {
            //pass
        }else{
            this.logger.warn(`Session storage not supported: "${c_session_storage}", session disabled`);
            return null;
        }
        switch(c_session_storage) {
            case "redis":
                return new RedisSessionStorage();
        }
        return null;
    }

    newRedis(configName: string): RedisClient {
        let opt:ClientOpts = {
            host: env(`${configName}_host`, '127.0.0.1'),
            port: envNumber(`${configName}_port`, 6379),
            db: envNumber(`${configName}_db`, 0),
        };
        let client = createClient(opt)
        client.on("error", function (err) {
            app.logger.error("Redis error: %s, config: %s", err, configName);
        });
        app.addShutdownHook(() => {client.quit()});
        return client;
    }
    
}

