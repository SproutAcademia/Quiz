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
    let timerActive = false

    //
    // Helpers
    //
    function showTitle(main: string, sub: string, durationSeconds: number) {
        // Convert seconds to ticks (20 ticks = 1 second)
        // We'll keep a short fade-in/out for smooth transitions
        let fadeIn = 10 // 0.5 seconds
        let stay = Math.max(durationSeconds * 20, 40) // ensure at least 2s visible
        let fadeOut = 20 // 1 second

        // Apply title timing and display the text
        player.execute(`title @a times ${fadeIn} ${stay} ${fadeOut}`)
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
        let sub = ""
        if (optionA[currentIndex]) sub += "1) " + optionA[currentIndex]
        if (optionB[currentIndex]) sub += "   2) " + optionB[currentIndex]
        if (optionC[currentIndex]) sub += "   3) " + optionC[currentIndex]
        if (optionD[currentIndex]) sub += "   4) " + optionD[currentIndex]

        // Big on-screen question
        showTitle(main, sub, tLimit)

        if (tLimit > 0) {
            player.say("You have " + tLimit + " seconds to answer.")
            timerActive = true
            let elapsed = 0

            // Run the timer in background
            loops.runInBackground(function () {
                while (timerActive && elapsed < tLimit) {
                    loops.pause(1000)
                    elapsed++
                }
                if (timerActive) {
                    timerActive = false
                    timeUp()
                }
            })
        } else {
            player.say("Type 1, 2, 3 or 4 in chat.")
            timerActive = false
        }
    }

    function timeUp() {
        showTitle("⏰ Time's up!", "No more answers for this question.")
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

    //% block="handle answer %option"
    //% option.min=1 option.max=4
    //% group="Control"
    export function handleAnswer(option: number) {
        if (currentIndex < 0 || currentIndex >= questionTexts.length) {
            player.say("No active question.")
            return
        }

        if (!timerActive && timeLimitSeconds[currentIndex] > 0) {
            player.say("Too late, time is up.")
            return
        }

        const correct = correctOption[currentIndex]
        if (option == correct) {
            score++
            showTitle("✅ Correct!", "Score: " + score + " / " + questionTexts.length, 3)
        } else {
            showTitle("❌ Incorrect", "Correct answer was option " + correct, 3)
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
 * Add a multiple choice question with 2–4 options.
 * correct is 1–4 (1 = A, 2 = B, 3 = C, 4 = D)
 * seconds = 0 means no time limit.
 */
//% block="add quiz question $qText | A $a | B $b | (opt) C $c | (opt) D $d | correct option $correct | time limit (s) $seconds"
//% qText.shadow=text a.shadow=text b.shadow=text c.shadow=text d.shadow=text
//% correct.min=1 correct.max=4
//% seconds.min=0 seconds.max=300
//% group="Setup"
export function addQuestionTimed(
    qText: string,
    a: string,
    b: string,
    c?: string,
    d?: string,
    correct?: number,
    seconds?: number
): void {
    if (correct == undefined) correct = 1
    if (seconds == undefined || seconds < 0) seconds = 0

    // fill missing options with empty strings
    optionA.push(a || "")
    optionB.push(b || "")
    optionC.push(c || "")
    optionD.push(d || "")
    questionTexts.push(qText)
    correctOption.push(correct)
    timeLimitSeconds.push(seconds)
}

    /**
     * Load quiz questions from text, one question per line:
     * Question|A|B|C|D|Correct(1-4)|TimeLimitSeconds
     */
    //% block="load quiz from text %data"
    //% group="Setup"
    export function loadQuizFromText(data: string): void {
        // Start fresh
        resetQuiz()

        if (!data) return

        const lines = data.split("\n")

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i]

            // Remove spaces at ends and skip empty lines
            line = line.trim()
            if (line.length == 0) continue

            const parts = line.split("|")
            // Need at least: question, A, B, C, D, correct
            if (parts.length < 6) {
                // Not enough data on this line, skip it
                continue
            }

            const qText = parts[0]
            const a = parts[1]
            const b = parts[2]
            const c = parts[3]
            const d = parts[4]

            // Correct option (1–4)
            let correct = parseInt(parts[5])
            if (isNaN(correct)) correct = 1
            if (correct < 1 || correct > 4) correct = 1

            // Optional time limit (7th field)
            let seconds = 0
            if (parts.length >= 7) {
                seconds = parseInt(parts[6])
                if (isNaN(seconds) || seconds < 0) seconds = 0
            }

            addQuestionTimed(qText, a, b, c, d, correct, seconds)
        }
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

    //
    // Players type 1–4 in chat to answer.
    //
    player.onChat("1", function () {
        handleAnswer(1)
    })

    player.onTellCommand("1", function () {
        handleAnswer(1)
    })

    player.onChat("2", function () {
        handleAnswer(1)
    })

    player.onTellCommand("2", function () {
        handleAnswer(1)
    })

    player.onChat("3", function () {
        handleAnswer(1)
    })

    player.onTellCommand("3", function () {
        handleAnswer(1)
    })

    player.onChat("4", function () {
        handleAnswer(1)
    })

    player.onTellCommand("4", function () {
        handleAnswer(1)
    })
}