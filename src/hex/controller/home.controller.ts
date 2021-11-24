import {env, envBool} from '../../pine';
import {HomeController} from '../../controller/home.controller';
import {injectable} from 'inversify';
import Joi from 'joi';
import fs from 'fs';

@injectable()
export class MyHomeController extends HomeController{

    indexAction() {
        let msg = 'welcome to '+env('app_name');
        let envStr = ` timezone = ${env('app_timezone')}, debug = ${envBool('app_debug')}`;
        return this.success(msg+envStr);
    }

    echoAction() {
        return this.success({
            controller: this.ctx.controller,
            action: this.ctx.action,
            method: this.ctx.request.method,
            params: this.ctx.params,
            files: this.ctx.files,
        });
    }

    //fake login, do nothing actually
    loginAction() {
        const schema = Joi.object({
            username: Joi.string()
                .alphanum()
                .min(3)
                .max(30)
                .required(),
            password: Joi.string()
                .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
            userid: Joi.number()
                .required(),
        });
        let params = this.ctx.validate(schema);
        return this.success({
            username: params.username,
            username_type: typeof params.username,
            userid: params.userid,
            userid_type: typeof params.userid,
        });
    }

    async rawAction() {
        const format = this.ctx.params.format || 'raw';
        if(format == 'json') {
            const json = await this.ctx.getJsonBody();
            return this.success({json: json});
        }
        const rawBody = await this.ctx.getRawBody();
        return this.success({raw: rawBody});
    }

    async uploadAction() {
        const files = this.ctx.files;
        if(files && files['myfile']){
            console.log(files['myfile']);
            const content = await new Promise((resolve, reject) => {
                fs.readFile(files['myfile'][0]['path'], function(err, data) {
                    if (err) {
                        reject('read error');
                    }else{
                        resolve(data);
                    }
                });
            });

            return this.success({
                size: files['myfile'][0]['size'],
                actual_size: (content as string).length,
                content: content,
            })
        }
        return this.failed('no file uploaded');
    }
}