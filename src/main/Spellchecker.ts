import { closest } from "fastest-levenshtein";

export default class Spellchecker {
    public constructor(private readonly namesList: readonly string[]) {}

    public spellcheck(name: string): string {
        return closest(name, this.namesList);
    }
}