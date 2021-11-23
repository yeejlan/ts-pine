import {injectable} from 'inversify';
import {Context} from '../pine';

@injectable()
export class BaseController {
    ctx!: Context;

    json(data: any, code: number, message: string): object {
        return {
            'code': code,
            'data': data ?? null,
            'message': message,
            'request_id': this.ctx.id,
        };
    }

    success(data: any = null): object {
        return this.json(data, 0, 'success');
    }

    failed(message: string, code = 1000): object {
        return this.json(null, code, message);
    }
}