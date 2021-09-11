/**
 * User: Bc. Milián Daniel
 * Date: 12/09/2021
 * Time: 00:32
 */

/**
 *
 */
export class BidirectionalMap<K, V> {
    private keyToVal: Map<K, V>;
    private valToKey: Map<V, K>;

    constructor() {
        this.keyToVal = new Map<K, V>();
        this.valToKey = new Map<V, K>();
    }

    public clear(): void {
        this.keyToVal.clear();
        this.valToKey.clear();
    }

    public deleteKey(key: K): boolean {
        if (!this.keyToVal.has(key)) {
            return false;
        }
        let v: V = this.keyToVal.get(key);
        this.keyToVal.delete(key);
        this.valToKey.delete(v);
        return true;
    }

    public deleteVal(val: V): boolean {
        if (!this.valToKey.has(val)) {
            return false;
        }
        let k: K = this.valToKey.get(val);
        this.valToKey.delete(val);
        this.keyToVal.delete(k);
        return true;
    }

    public get(key: K): V | undefined {
        return this.keyToVal.get(key);
    }

    public val(value: V): K | undefined {
        return this.valToKey.get(value);
    }

    public hasKey(key: K): boolean {
        return this.keyToVal.has(key);
    }

    public hasValue(val: V): boolean {
        return this.valToKey.has(val);
    }

    public set(key: K, value: V): this {
        this.keyToVal.set(key, value);
        this.valToKey.set(value, key);
        return this;
    }

}