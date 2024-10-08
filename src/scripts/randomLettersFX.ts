// Copyright (C) 2023 Calin Radoni. Licensed under the MIT license (https://opensource.org/license/mit/).

/**
 * Random letters effect
 *
 * Version 1.8.0-ish
 *
 * @remarks
 * The newest version of this script should be in the
 * {@link https://github.com/CalinRadoni/Scripts} repository.
 *
 * @example CodePen
 * See the {@link https://codepen.io/CalinRadoni/pen/BabdBre} pen.
 *
 * @example Usage
 * ```html
 * <h1 id="titleText"></h1>
 * ```
 * ```ts
 * const fxText = new RandomLetterFX("titleText", "CalinRadoni.github.io");
 * fxText.begin();
 * ```
 *
 * @example Usage Astro
 * ```html
 * <h1 id="titleText"></h1>
 * ```
 * ```astro
 * <script>
 *   import { RandomLetterFX } from "../scripts/textfx";
 *   const fxText = new RandomLetterFX("titleText", "CalinRadoni.github.io");
 *   fxText.begin();
 * </script>
 * ```
 */

export { RandomLetterFX };

interface Letter {
    char: string;
    steps: number;
}

class RandomLetterFX {
    // just the dot
    private alphabet0: string = ".";
    // all ASCII printable chars, this may break the words on overflow
    private alphabet1: string = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
    // this should / may keep the formatting and not break original words
    private alphabet2: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~@#^&*_=<>";
    // test
    private alphabet3: string = "abcdefghijklmnopqrstuvwxyz";
    // private alphabet3 = String.fromCharCode(9728, 9730, 9731, 9733, 9734, 9737, 9743, 9752, 9760, 9762, 9763, 9786);

    private delay: number = 100;
    private displayOneByOne: boolean = false;
    private maxSteps: number = 20;

    private minRandomSteps: number = 2;
    private maxRandomSteps: number = 0;

    private alphabet: string = "";

    private displayLength: number = 0;
    private letters: Array<Letter> = [];
    private output: string = "";

    private elemId: string = "";

    /**
     * @param id - the id of the HTML element where the text will be rendered
     * @param text - the text that will be rendered
     */
    constructor(id: string, text: string) {
        this.elemId = id;

        for (let i = 0; i < text.length; ++i) {
            this.letters.push({
                char: text.charAt(i),
                steps: this.minRandomSteps
            });
        }

        this.maxRandomSteps = this.letters.length + 1;
        if (this.maxRandomSteps > this.maxSteps) {
            this.maxRandomSteps = this.maxSteps;
        }
    }

    /**
     * Start the effect
     */
    begin(alphabetID: number = 0) {
        switch (alphabetID) {
            case 1: this.alphabet = this.alphabet1; break;
            case 2: this.alphabet = this.alphabet2; break;
            case 3: this.alphabet = this.alphabet3; break;
            default: this.alphabet = this.alphabet0; break;
        }

        if (this.letters.length > 0) {
            this.buildSteps();
            this.displayLength = this.displayOneByOne ? 1 : this.letters.length;
            this.run();
        }
    }

    /**
     * @returns true if the parameter contains a whitespace char
     */
    private containsWhiteSpace(str: string) {
        return /\s/g.test(str);
    }
    /**
     * Build the steps used for random number of letters
     */
    private buildSteps() {
        for (let i = 0; i < this.letters.length; ++i) {
            if (this.containsWhiteSpace(this.letters[i].char)) {
                this.letters[i].steps = 0;
            }
            else {
                this.letters[i].steps = this.minRandomSteps +
                    (Math.floor(
                        (this.maxRandomSteps - this.minRandomSteps) * Math.random()));
            }
        }
    }

    /**
     * Calls the {@link RandomLetterFX.frame} function and, if the animation is not over,
     * schedules another frame processing after {@link RandomLetterFX.delay} milliseconds.
     */
    private run() {
        setTimeout(() => {
            if (!this.frame()) {
                this.run();
            }
        }, this.delay);
    }

    private charToHTMLName(ch: string): string {
        let str: string = "";
        switch (ch) {
            case "<": { str = "&lt;"; break;}
            case ">": { str = "&gt;"; break;}
            case "&": { str = "&amp;"; break;}
            case "\"": { str = "&quot;"; break;}
            case "'": { str = "&apos;"; break;}
            case "\\": { str = "&bsol;"; break;}
            case "/": { str = "&sol;"; break;}
            default: { str = ch; break; }
        }
        return str;
    }

    /**
     * Create a new "frame" and set the content of the destination HTML element.
     *
     * @returns true when animation is over
     */
    private frame(): boolean {
        let done = true;
        this.output = "";
        for (let ci = 0; ci < this.letters.length; ++ci) {
            if (ci < this.displayLength) {
                if (this.letters[ci].steps > 0) {
                    let randomPos = Math.floor(this.alphabet.length * Math.random());
                    let ch = this.charToHTMLName(this.alphabet.charAt(randomPos));
                    this.output += `<span style="opacity:0.5">${ch}</span>`;
                    --this.letters[ci].steps;
                    done = false;
                }
                else {
                    this.output += this.charToHTMLName(this.letters[ci].char);
                }
            }
            else {
                let ch = this.charToHTMLName(this.letters[ci].char);
                this.output += `<span style="opacity:0">${ch}</span>`;
            }
        }
        if(this.displayLength < this.letters.length) {
            ++this.displayLength;
        }

        let outField = document.getElementById(this.elemId);
        if (outField !== null) {
            outField.innerHTML = this.output;
        }

        return done;
    }
}
