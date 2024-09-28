import { describe, expect, it } from "vitest";
import Spellchecker from "../main/Spellchecker";
import * as fs from "fs";

const spellchecker = new Spellchecker(fs.readFileSync("names.txt").toString().split("\n"));

/* eslint sonarjs/no-duplicate-string: 0 */
describe("A spellchecker", () => {
    describe("when searching for an exact match", () => {
        it("should return it", () => {
            expect(spellchecker.spellcheck("Giratina")).toBe("Giratina");
        });
    });

    describe("when searching for an uncapitalized match", () => {
        it("should return it but capitalized", () => {
            expect(spellchecker.spellcheck("dialga")).toBe("Dialga");
        });
    });

    describe("when searching for a specific variant", () => {
        it("should return it but with the correct name", () => {
            expect(spellchecker.spellcheck("Ponyta forma hisui")).toBe("Ponyta forma Galar");
        });
    });

    describe("when not searching for a specific variant", () => {
        it("should not return it", () => {
            expect(spellchecker.spellcheck("ponyta")).toBe("Ponyta");
        });
    });
});
