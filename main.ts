//% color=#ffa500 icon="\uf128" block="Quiz"
namespace SproutAcademia {
    // Internal storage (using var for maximum compatibility)
    var questionTexts: string[] = []
    var optionA: string[] = []
    var optionB: string[] = []
    var optionC: string[] = []
    var optionD: string[] = []
    var correctOption: number[] = [] // 1–4

    /**
     * Add a multiple choice question with 4 options.
     * correct is 1–4 (1 = A, 2 = B, 3 = C, 4 = D)
     */
    //% block="Add quiz question $qText | A $a | B $b | C $c | D $d | correct option $correct"
    //% qText.shadow=text a.shadow=text b.shadow=text c.shadow=text d.shadow=text
    //% correct.min=1 correct.max=4
    export function addQuestion(
        qText: string,
        a: string,
        b: string,
        c: string,
        d: string,
        correct: number
    ): void {
        if (correct < 1 || correct > 4) {
            correct = 1
        }
        questionTexts.push(qText)
        optionA.push(a)
        optionB.push(b)
        optionC.push(c)
        optionD.push(d)
        correctOption.push(correct)
    }

    /**
     * Get the text of the question at the given position (1 = first question).
     * Returns empty text "" if the index is out of range.
     */
    //% block="Question text at position %index"
    //% index.min=1
    export function getQuestionText(index: number): string {
        let i = index - 1
        if (i < 0 || i >= questionTexts.length) {
            return ""
        }
        return questionTexts[i]
    }
}