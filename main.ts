//% color=#ffa500 icon="\uf128" block="Sprout Quiz"
namespace SproutQuiz {
    //
    // Internal storage
    //
    let questionTexts: string[] = []
    let optionA: string[] = []
    let optionB: string[] = []
    let optionC: string[] = []
    let optionD: string[] = []
    let correctOption: number[] = []      // 1–4
    let timeLimitSeconds: number[] = []   // per question

    // Quiz state
    let currentIndex = -1
    let score = 0
    let questionEndTime = 0
    let timerActive = false

    // Local vote counts (for THIS player/project)
    let votesA = 0
    let votesB = 0
    let votesC = 0
    let votesD = 0

    function optionLabel(n: number): string {
        if (n == 1) return "1"
        if (n == 2) return "2"
        if (n == 3) return "3"
        if (n == 4) return "4"
        return "?"
    }

    function showTitle(main: string, sub: string) {
        // NOTE: uses @s, so each player sees their own titles
        player.execute(`title @s title "${main}"`)
        player.execute(`title @s subtitle "${sub}"`)
    }

    function askCurrentQuestion() {
        if (currentIndex < 0 || currentIndex >= questionTexts.length) {
            player.say("No more questions.")
            return
        }

        // Reset local vote counts for this question
        votesA = 0
        votesB = 0
        votesC = 0
        votesD = 0

        const qNum = currentIndex + 1
        const qText = questionTexts[currentIndex]
        const tLimit = timeLimitSeconds[currentIndex]

        const main = "Q" + qNum + ": " + qText
        const sub = "1) " + optionA[currentIndex]
            + "  2) " + optionB[currentIndex]
            + "  3) " + optionC[currentIndex]
            + "  4) " + optionD[currentIndex]

        showTitle(main, sub)

        // Optional: also show in chat
        player.say(main)
        player.say("1) " + optionA[currentIndex])
        player.say("2) " + optionB[currentIndex])
        player.say("3) " + optionC[currentIndex])
        player.say("4) " + optionD[currentIndex])
        player.say("You have " + tLimit + " seconds. Type 1, 2, 3 or 4 in chat.")

        // Start timer
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
    }

    function showLocalResults() {
        // Local counts for this player/project
        showTitle(
            "Time's up!",
            "1:" + votesA + "  2:" + votesB + "  3:" + votesC + "  4:" + votesD
        )
    }

    function timeUp() {
        showLocalResults()

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

    function handleAnswer(option: number) {
        if (currentIndex < 0 || currentIndex >= questionTexts.length) {
            player.say("No active question.")
            return
        }
        if (!timerActive) {
            player.say("Too late, time is up.")
            return
        }

        // Update LOCAL vote counts
        if (option == 1) votesA++
        if (option == 2) votesB++
        if (option == 3) votesC++
        if (option == 4) votesD++

        // Also update SHARED scoreboard counts (if teacher created the objective)
        // Objective name: quizVotes, players: A, B, C, D
        if (option == 1) player.execute("scoreboard players add A quizVotes 1")
        if (option == 2) player.execute("scoreboard players add B quizVotes 1")
        if (option == 3) player.execute("scoreboard players add C quizVotes 1")
        if (option == 4) player.execute("scoreboard players add D quizVotes 1")

        const correct = correctOption[currentIndex]
        if (option == correct) {
            score++
            showTitle("✅ Correct!", "Score: " + score + " / " + questionTexts.length)
        } else {
            showTitle("❌ Incorrect", "Correct was option " + optionLabel(correct))
        }
    }

    //
    // BLOCKS: Setup
    //

    /**
     * Clear all questions and reset quiz state.
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
        votesA = votesB = votesC = votesD = 0
    }

    /**
     * Add a timed multiple choice question (4 options).
     * correct is 1–4 (1 = A, 2 = B, 3 = C, 4 = D)
     */
    //% block="add quiz question $qText | A $a | B $b | C $c | D $d | correct option $correct | time limit (s) $seconds"
    //% qText.shadow=text a.shadow=text b.shadow=text c.shadow=text d.shadow=text
    //% correct.min=1 correct.max=4
    //% seconds.min=1 seconds.max=300
    //% group="Setup"
    export function addTimedQuestion(
        qText: string,
        a: string,
        b: string,
        c: string,
        d: string,
        correct: number,
        seconds: number
    ): void {
        if (correct < 1 || correct > 4) correct = 1
        if (seconds < 1) seconds = 10
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
            player.say("No questions in quiz yet!")
            return
        }
        score = 0
        currentIndex = 0
        askCurrentQuestion()
    }

    /**
     * Skip to the next question immediately.
     */
    //% block="skip to next question"
    //% group="Control"
    export function skipToNextQuestion(): void {
        timerActive = false
        if (questionTexts.length == 0) {
            player.say("No questions in quiz.")
            return
        }
        if (currentIndex < 0) {
            currentIndex = 0
        } else if (currentIndex < questionTexts.length - 1) {
            currentIndex += 1
        } else {
            finishQuiz()
            return
        }
        askCurrentQuestion()
    }

    //
    // BLOCKS: Info
    //

    /**
     * Get current score.
     */
    //% block="quiz score"
    //% group="Info"
    export function getScore(): number {
        return score
    }

    /**
     * Get total number of questions in this quiz.
     */
    //% block="quiz question count"
    //% group="Info"
    export function getQuestionCount(): number {
        return questionTexts.length
    }

    /**
     * Get current question number (1-based), or 0 if none.
     */
    //% block="current question number"
    //% group="Info"
    export function getCurrentQuestionNumber(): number {
        if (currentIndex < 0) return 0
        return currentIndex + 1
    }

    /**
     * Approximate time left in the current question (seconds).
     */
    //% block="time left in question (s)"
    //% group="Info"
    export function timeLeft(): number {
        if (!timerActive) return 0
        const ms = questionEndTime - control.millis()
        if (ms <= 0) return 0
        return Math.idiv(ms, 1000)
    }

    //
    // BLOCKS: Votes / Scoreboard (classwide counts)
    //

    /**
     * Prepare the scoreboard objective used to count answers A–D.
     * Run once (e.g. on start) with teacher perms.
     */
    //% block="prepare quiz vote scoreboard"
    //% group="Votes"
    export function prepareVoteScoreboard(): void {
        player.execute("scoreboard objectives add quizVotes dummy")
    }

    /**
     * Reset vote counts A–D on the scoreboard and local counters.
     */
    //% block="reset quiz vote counts"
    //% group="Votes"
    export function resetVoteCounts(): void {
        player.execute("scoreboard players reset A quizVotes")
        player.execute("scoreboard players reset B quizVotes")
        player.execute("scoreboard players reset C quizVotes")
        player.execute("scoreboard players reset D quizVotes")
        votesA = 0
        votesB = 0
        votesC = 0
        votesD = 0
    }

    /**
     * Show quiz vote counts (A–D) on the sidebar.
     */
    //% block="show quiz vote counts on sidebar"
    //% group="Votes"
    export function showVotesSidebar(): void {
        player.execute("scoreboard objectives setdisplay sidebar quizVotes")
    }

    /**
     * Hide quiz vote counts from the sidebar.
     */
    //% block="hide quiz vote counts from sidebar"
    //% group="Votes"
    export function hideVotesSidebar(): void {
        player.execute("scoreboard objectives setdisplay sidebar")
    }

    //
    // CHAT HANDLERS: students answer with 1, 2, 3, or 4
    //

    player.onTellCommand("1", function () {
        handleAnswer(1)
    })
    player.onTellCommand("2", function () {
        handleAnswer(2)
    })
    player.onTellCommand("3", function () {
        handleAnswer(3)
    })
    player.onTellCommand("4", function () {
        handleAnswer(4)
    })
}