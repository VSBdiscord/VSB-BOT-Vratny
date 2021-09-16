/**
 * User: Bc. Milián Daniel
 * Date: 12/09/2021
 * Time: 23:38
 */

/**
 *
 */
export abstract class StringUtils {
    private constructor() {
    }

    /**
     *
     * @param string
     * @param delimiter
     */
    public static Split(string: string, delimiter: string): string[] {
        let regex: RegExp = new RegExp("[^" + delimiter + "\"]+|\"([^\"]*)\"", "gi");
        let array: string[] = [];

        let match;
        do {
            match = regex.exec(string);
            if (match !== null) {
                array.push(match[1] ? match[1] : match[0]);
            }
        } while (match !== null);

        return array;
    }
}