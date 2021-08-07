/**
 * User: Bc. Milián Daniel
 * Date: 07/08/2021
 * Time: 23:14
 */
import {Service} from "../service";
import {ServiceComponent} from "../decorators/ServiceComponent";
import {IgnoreService} from "../decorators/IgnoreService";

@ServiceComponent
@IgnoreService
export class AdminService extends Service {
    constructor() {
        super();
    }
}
