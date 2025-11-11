//% color=#ffa500 icon="\uf128" block="Quiz"
namespace SproutAcademia {
    //
    // Internal storage
    //
    let questionTexts: string[] = []
    let optionA: string[] = []
    let optionB: string[] = []
    let optionC: string[] = []
    let optionD: string[] = []
    let correctOption: number[] = []      // 1–4
    let timeLimitSeconds: number[] = []   // per question (0 = no timer)

    // Quiz state
    let currentIndex = -1
    let score = 0
    let questionEndTime = 0
    let timerActive = false

    //
    // Helpers
    //
    function showTitle(main: string, sub: string) {
        // Use @a to show to everyone in the world.
        // Change to @s if you only want the local player to see it.
        player.execute(`title @a title "${main}"`)
        player.execute(`title @a subtitle "${sub}"`)
    }

    function askCurrentQuestion() {
        if (currentIndex < 0 || currentIndex >= questionTexts.length) {
            player.say("No more questions.")
            timerActive = false
            return
        }

        const qNum = currentIndex + 1
        const qText = questionTexts[currentIndex]
        const tLimit = timeLimitSeconds[currentIndex]

        const main = "Q" + qNum + ": " + qText
        const sub = "1) " + optionA[currentIndex]
            + "   2) " + optionB[currentIndex]
            + "   3) " + optionC[currentIndex]
            + "   4) " + optionD[currentIndex]

        // Big on-screen question
        showTitle(main, sub)

        // Also show in chat for readability
        player.say(main)
        player.say("1) " + optionA[currentIndex])
        player.say("2) " + optionB[currentIndex])
        player.say("3) " + optionC[currentIndex])
        player.say("4) " + optionD[currentIndex])

        if (tLimit > 0) {
            player.say("You have " + tLimit + " seconds. Type 1, 2, 3 or 4 in chat.")
            questionEndTime = control.millis() + tLimit * 1000
            timerActive = true

            control.inBackground(function () {
                while (timerActive && currentIndex >= 0) {
                    if (control.millis() >= questionEndTime) {
                        timerActive = false
                        timeUp()
                        break
                    }
                    basic.pause(200)
                }
            })
        } else {
            player.say("Type 1, 2, 3 or 4 in chat.")
            timerActive = false
        }
    }

    function timeUp() {
        showTitle("Time's up!", "No more answers for this question.")
        // Move to next question or finish
        if (currentIndex < questionTexts.length - 1) {
            currentIndex += 1
            askCurrentQuestion()
        } else {
            finishQuiz()
        }
    }

    function finishQuiz() {
        showTitle("Quiz finished!", "Score: " + score + " / " + questionTexts.length)
        player.say("Quiz finished!")
        player.say("Your score: " + score + " / " + questionTexts.length)
        currentIndex = -1
        timerActive = false
    }

    //% block="Handle Answer"
    //% group="Setup"
    function handleAnswer(option: number) {
        if (currentIndex < 0 || currentIndex >= questionTexts.length) {
            player.say("No active question.")
            return
        }

        // If there is a timer, check if we're already out of time
        if (timerActive && control.millis() > questionEndTime) {
            timerActive = false
            player.say("Too late, time is up.")
            return
        }

        const correct = correctOption[currentIndex]
        if (option == correct) {
            score++
            showTitle("✅ Correct!", "Score: " + score + " / " + questionTexts.length)
        } else {
            showTitle("❌ Incorrect", "Correct answer was option " + correct)
        }

        // Move to next question or finish
        if (currentIndex < questionTexts.length - 1) {
            currentIndex += 1
            askCurrentQuestion()
        } else {
            finishQuiz()
        }
    }

    //
    // BLOCKS: Setup
    //

    /**
     * Clear all questions and reset the quiz.
     */
    //% block="reset quiz"
    //% group="Setup"
    export function resetQuiz(): void {
        questionTexts = []
        optionA = []
        optionB = []
        optionC = []
        optionD = []
        correctOption = []
        timeLimitSeconds = []
        currentIndex = -1
        score = 0
        timerActive = false
    }

    /**
     * Add a multiple choice question (4 options) with an optional time limit.
     * correct is 1–4 (1 = A, 2 = B, 3 = C, 4 = D)
     * seconds = 0 means no time limit.
     */
    //% block="add quiz question $qText | A $a | B $b | C $c | D $d | correct option $correct | time limit (s) $seconds"
    //% qText.shadow=text a.shadow=text b.shadow=text c.shadow=text d.shadow=text
    //% correct.min=1 correct.max=4
    //% seconds.min=0 seconds.max=300
    //% group="Setup"
    export function addQuestionTimed(
        qText: string,
        a: string,
        b: string,
        c: string,
        d: string,
        correct: number,
        seconds: number
    ): void {
        if (correct < 1 || correct > 4) correct = 1
        if (seconds < 0) seconds = 0
        questionTexts.push(qText)
        optionA.push(a)
        optionB.push(b)
        optionC.push(c)
        optionD.push(d)
        correctOption.push(correct)
        timeLimitSeconds.push(seconds)
    }

    //
    // BLOCKS: Control
    //

    /**
     * Start the quiz from the first question.
     */
    //% block="start quiz"
    //% group="Control"
    export function startQuiz(): void {
        if (questionTexts.length == 0) {
            player.say("No questions in quiz yet.")
            return
        }
        score = 0
        currentIndex = 0
        askCurrentQuestion()
    }

    //
    // BLOCKS: Info
    //

    /**
     * Get the current score.
     */
    //% block="quiz score"
    //% group="Info"
    export function getScore(): number {
        return score
    }

    /**
     * Get the total number of questions.
     */
    //% block="quiz question count"
    //% group="Info"
    export function getQuestionCount(): number {
        return questionTexts.length
    }

    /**
     * Get the current question number (1-based), or 0 if none.
     */
    //% block="current question number"
    //% group="Info"
    export function getCurrentQuestionNumber(): number {
        if (currentIndex < 0) return 0
        return currentIndex + 1
    }
}

