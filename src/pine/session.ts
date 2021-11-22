import {app} from './app';
import {envBool} from './functions';

export interface SessionStorage {
    load(sessionId: string): Promise<string>;
    save(sessionId: string, data: string): Promise<void>;
}

export class Session {
    protected sessionEnable: boolean = envBool('session_enable', false);
    protected changed: boolean = false;
    protected sessionStorage: SessionStorage;
    storage: Map<string, any> = new Map;
    sessionId: string = '';

    constructor() {
        this.sessionStorage = app.get('session.storage');
    }

    set(key: string, value: any) {
        this.touch();
        this.storage.set(key, value);
    }

    get(key: string): any {
        return this.storage.get(key);
    }

    delete(key: string) {
        this.touch();
        this.storage.delete(key);
    }

    touch() {
        this.changed = true;
    }

    async destroy() {
        this.touch();
        this.storage = new Map;
        await this.save();
    }

    async load() {
        if(!this.sessionId){
            return;
        }

        if(this.sessionEnable && this.sessionStorage) {
            let valueStr = await this.sessionStorage.load(this.sessionId);
            try{
                this.storage = JSON.parse(valueStr);
                if(!this.storage) {
                    this.storage = new Map;
                }
            }catch(e){
                return;
            }
        }
    }

    async save() {
        if(!this.changed) {
            return;
        }

        this.changed = false;
        if(!this.sessionId) {
            return;
        }

        if(this.sessionEnable && this.sessionStorage) {
            let valueStr =  JSON.stringify(this.storage);
            await this.sessionStorage.save(this.sessionId, valueStr);
        }
    }
}

