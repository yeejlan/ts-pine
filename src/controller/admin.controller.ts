import {injectable} from 'inversify';

@injectable()
export class AdminController {

    indexAction() {
        return 'this is admin/index page';
    }
}