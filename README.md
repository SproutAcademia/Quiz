# 🌱 Sprout Academia Quiz Extension

An educational **quiz and question system** for **Minecraft: Education Edition** using MakeCode.  
It allows teachers to create multiple-choice quizzes that display questions as **titles/subtitles** on screen — perfect for interactive lessons, trivia games, or class reviews.

---

## ✨ Features

- 📖 Add multiple-choice questions with **2–4 answer options**
- ⏱️ Question title automatically stays visible for the entire timer duration
- 💬 Students answer by typing **1**, **2**, **3**, or **4** in chat
- 🧮 Tracks score and total questions automatically
- 📂 Supports loading questions from a text file (`quiz.txt`)
- 🎓 Designed for classrooms — no chat clutter, only clean on-screen titles
- ✅ Fully compatible with **Minecraft Education 1.20.12+**

---

## 🧩 Installation

1. Open **MakeCode for Minecraft: Education Edition**.  
2. In your project, click **Advanced → Extensions**.  
3. Paste your GitHub repo URL (for example):  https://github.com/YourUserName/sprout-academia-quiz
4. Wait for the extension to load. You’ll see a new toolbox category named **Quiz** or **SproutAcademia**.

---

## 🚀 Quick Start Example

Add a question and start the quiz when typing `start` in chat:

```ts
SproutAcademia.resetQuiz()

SproutAcademia.addQuestionTimed(
 "Which mob explodes when close to you?",
 "Zombie",
 "Creeper",
 "Skeleton",
 "Spider",
 2,
 10
)

player.onChat("start", function () {
 SproutAcademia.startQuiz()
})
```

Players type 1, 2, 3, or 4 in chat to answer.

✅ Correct answers show a green title; ❌ incorrect answers show a red one.

---

🧩 Two-Answer (True/False) Questions
You can now add questions with only two answer options (A and B):

```ts
SproutAcademia.addQuestionTimed(
    "The Earth orbits the Sun.",
    "True",
    "False",
    "", "",   // leave C and D blank
    1,        // 1 = option A = True
    8
)
```
This will only display:

```graphql
1) True   2) False
```
and still use the same answer commands (1 or 2).

---

📂 Loading Questions from a File
You can use the File extension to import questions from a .txt file.

Each line in the file represents one question in this format:

```cpp
Question | A | B | (optional C) | (optional D) | CorrectOption | TimeLimitSeconds
```
✅ Example quiz.txt
```text
What do you need to craft a torch?|Stick and coal|Stick and iron|Wood and coal|Sand and stick|1|15
Which mob explodes when close to you?|Zombie|Creeper|Skeleton|Spider|2|10
The Earth orbits the Sun.|True|False|||1|5
```
✅ Code to load from file
```ts
let quizData = files.readText("quiz.txt")
SproutAcademia.loadQuizFromText(quizData)
SproutAcademia.startQuiz()
```

---

🧱 Available Blocks
| Block                       | Description                                                                      |
| --------------------------- | -------------------------------------------------------------------------------- |
| **reset quiz**              | Clears all questions and resets score                                            |
| **add quiz question**       | Adds a question with 2–4 answer options, correct answer, and optional time limit |
| **start quiz**              | Begins the quiz from the first question                                          |
| **handle answer**           | Manually triggers an answer check (usually called by typing 1–4 in chat)         |
| **quiz score**              | Returns how many correct answers so far                                          |
| **quiz question count**     | Returns total number of questions                                                |
| **current question number** | Returns the index (1-based) of the current question                              |
| **load quiz from text**     | Loads multiple questions from a `.txt` file formatted as shown above             |

---

🕹️ Controls
Students answer by typing 1, 2, 3, or 4 in chat.

Questions automatically advance after each answer or when time expires.

Titles stay visible for the full duration of the timer — no chat spam.

---

🧠 Customization
You can modify the fade-in / fade-out speed of the title directly in the showTitle() helper function:

```ts
player.execute(`title @a times 10 200 20`)
```
Format:
title @a times <fadeInTicks> <stayTicks> <fadeOutTicks>
(20 ticks = 1 second)

The quiz automatically scales this timing to match each question’s time limit.

---

🧰 Technical Details
Target: Minecraft Education Edition MakeCode (TypeScript)

No unsupported namespaces (control, basic) — uses loops and player only

Works in both single-player and classroom multiplayer worlds

All titles shown via /title commands with customizable duration

---

🧑‍🏫 Classroom Use
Teachers can:

Prepare a quiz.txt file with all questions beforehand

Load it in class using /loadquiz or a “Load Quiz” button block

Let students answer live by typing 1, 2, 3, or 4

View correct/incorrect responses in real-time on screen

🗂️ Example workflow
Create your quiz in a text file named quiz.txt.

Store it in the same folder as your MakeCode world (or read it using the File extension).

Run:

```ts
let text = files.readText("quiz.txt")
SproutAcademia.loadQuizFromText(text)
```
Type start in chat to begin.

---

🏷️ License
MIT License © 2025 Sprout Academia

---


💚 Contributing
Request to be added to this repo, only for Sprout Academia instructors.