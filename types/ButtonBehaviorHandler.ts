/**
 * User: Bc. Milián Daniel
 * Date: 13/09/2021
 * Time: 04:05
 */


import {ButtonInteractionWrap} from "./ButtonInteractionWrap";
import {Service} from "../service";

export type ButtonBehaviorCallback =
    (interaction: ButtonInteractionWrap, args: string[]) => Promise<void>;


export class ButtonBehaviorHandler {
    public readonly service: Service;
    public readonly callback: ButtonBehaviorCallback;

    constructor(service: Service, callback: ButtonBehaviorCallback) {
        this.service = service;
        this.callback = callback;
    }
}