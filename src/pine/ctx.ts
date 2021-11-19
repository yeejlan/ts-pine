import http from 'http';
import {Cookies} from 'cookies';
import {Session} from './session';
import {app} from './app';
import uuidv4 from 'uuid/v4';
import ejs from 'ejs';
import path from 'path';

export class Ctx {
    protected logger = app.logger;
    protected sessionName = env()
    protected session = new Session();
    constructor(request, response) {
        this.request = request;
        this.response = response;
        this.cookies = new Cookies(request, response);

        this._sessionName = app.getConfig()['session.name'];
        this._cookieDomain = app.getConfig()['cookie.domain'];
        this._sessionExpire = parseInt(app.getConfig()['session.expire.seconds']) || 3600;
        this._sessionEnable = app.getConfig()['session.enable'];

        this.session = new Session();
    }

    async newSession(){
        if(!this.sessionEnable){
            return;
        }
        await this.session.destroy();
        this.session.setSessionId(uuidv4());
        this.cookies.set(this._sessionName, this.session.getSessionId(), {
            domain: this._cookieDomain
        })
    }

    async loadSession() {
        if(!this._sessionEnable){
            return;
        }
        let sessionId = this.cookies.get(this._sessionName);
        if(!sessionId){
            await this.newSession();
        }else{
            this.session.setSessionId(sessionId);
            await this.session.load();
        }
    }

    async flushSession() {
        await this.session.save();
    }

    async render(filename, data) {
        let tplbase = 'templates';
        let options = {
            cache: true,
            client: false,
            async: true,
            root: tplbase
        }
        if(this.app.getEnv() == this.app.DEVELOPMENT) {
            options.cache = false;
        }
        let fullname = path.join(tplbase, `${filename}.ejs`)
        return new Promise((resolve, reject) => {
            ejs.renderFile(fullname, data, options, function(err, str){
                if(err) {
                    this.logger.error("Template render error: %s", err);
                    resolve('');
                }
                resolve(str);
            });
        });
    }

    exit() {
        throw new RequestProcessCompleteException();
    }

    redirect(location: string) {
        this.response.writeHead(302, {
            'Location': location
        });
    }
}

export class RequestProcessCompleteException extends Error {}

