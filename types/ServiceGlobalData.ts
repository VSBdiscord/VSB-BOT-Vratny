/**
 * User: Bc. Milián Daniel
 * Date: 12/09/2021
 * Time: 14:29
 */

import {Service} from "../service";
import {ButtonBehaviorCallback, ButtonBehaviorHandler} from "./ButtonBehaviorHandler";

export class ServiceGlobalData {
    private readonly buttonBehaviorDict: { [uniqueKey: string]: ButtonBehaviorHandler } = {};

    public AddButtonBehavior(handlingService: Service, uniqueKey: string, callback: ButtonBehaviorCallback) {
        if (this.buttonBehaviorDict[uniqueKey] !== undefined) {
            throw new Error(`Button behavior with key ${uniqueKey} already exists!`);
        }
        this.buttonBehaviorDict[uniqueKey] = new ButtonBehaviorHandler(handlingService, callback);
    }

    public GetButtonBehavior(uniqueKey: string): ButtonBehaviorHandler | undefined {
        return this.buttonBehaviorDict[uniqueKey];
    }
}

