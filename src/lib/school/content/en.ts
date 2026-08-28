import type { SchoolContent } from "../types";

export const en: SchoolContent = {
  copy: {
    hero: {
      eyebrow: "Zig School",
      title: "The new std.Io",
      titleAccent: "in six missions",
      lead: "async, await, cancel — and why asynchrony is not concurrency. Six missions, four kinds of drills, instant feedback on every answer.",
      audience: "For JS/TS developers",
      audienceLead:
        "Every concept starts from something you already write in TypeScript, and every unfamiliar token is decoded on the spot.",
      tags: ["Zig 0.16", "std.Io", "No prior Zig required"],
    },
    skills: [
      "Io is an argument, not a runtime",
      "future = Promise",
      "try is throw, not catch",
      "cancel = AbortController + finally",
      "async ≠ concurrent",
    ],
    start: {
      begin: "Start the shift",
      resume: "Resume",
      restart: "Start over",
      saved: "Progress saved",
      mapTitle: "Mission log",
      storageNote: "Progress is kept in this browser only.",
    },
    shell: {
      exit: "Menu",
      xp: "XP",
      soundOn: "Sound on",
      soundOff: "Sound off",
    },
    level: {
      mission: "Mission",
      briefing: "Briefing",
      concept: "How it works",
      syntax: "Reading the syntax",
      sample: "On screen",
      toChallenge: "To the drill",
      backToBriefing: "Briefing",
      missionClear: "Mission clear",
      perfect: "Clean run — full reward.",
      partial: "Reward reduced for retries, but the ground is yours.",
      learned: "What you take with you",
      nextMission: "Next mission",
      toDebrief: "To the debrief",
    },
    challenge: {
      task: "Drill",
      diagnosis: "Diagnosis",
      fix: "The fix",
      reward: "Reward",
      heartsHint: "Attempts left",
      rewardHint: "Every retry costs 25% of the reward",
      check: "Check",
      tryAgain: "Try again",
      reveal: "Show me the answer",
      giveUp: "Reveal the answer",
      next: "Next",
      toFix: "To the fix",
      enterHint: "Enter",
      orderingBank: "Steps to place",
      orderingEmpty: "Tap a step to add it to the procedure",
      orderingRetryHint: "Tap a placed step to send it back",
      fillBankLabel: "Pick a line",
      timelineBank: "Log lines",
      timelineTotal: "Total run time",
      seconds: "s",
      totalRow: "Program exits after",
      fixOption: "Option",
    },
    feedback: {
      wrongOrder: "The order is off",
      wrongOrderAgain: "Still not the order the machine boots in",
      correctOrder: "Boot sequence accepted",
      perfectOrder: "Booted first try",
      revealOrder: "Here is the boot sequence",
      wrongBlanks: "Not quite",
      wrongBlanksAgain: "Still not it",
      correctBlanks: "The line compiles",
      perfectBlanks: "Written first try",
      revealBlanks: "Here is the working version",
      wrongTimeline: "The log does not read like that",
      wrongTimelineAgain: "The timing is still off",
      correctTimeline: "That is exactly the log",
      perfectTimeline: "Read it first try",
      revealTimeline: "Here is the real log",
      wrongChoice: "Not the cause",
      wrongChoiceAgain: "Still not the cause",
      correctChoice: "Correct diagnosis",
      correctFix: "The fix holds",
      revealChoice: "Here is what actually happened",
    },
    completion: {
      eyebrow: "Debrief",
      of: "of",
      mastery: "mastery",
      cleanRuns: "clean runs",
      log: "Mission log",
      concepts: "What you now know about std.Io",
      epilogue:
        "The convoy left at 04:00. The camp mainframe still boots the way you assembled it: memory, then an I/O implementation, then an interface handed down as an argument — nothing running behind your back.",
      replay: "Run it again",
      menu: "Back to menu",
      replayHint: "A fresh run resets the score and the mission log.",
      noMistakes: "clean",
      oneMistake: "1 retry",
      manyMistakes: "retries",
      maxedMistakes: "revealed",
    },
    ranks: [
      {
        title: "Camp architect",
        badge: "S",
        verdict:
          "You did not just pass — you read the code the way its author does. Someone else's std.Io will not surprise you now.",
      },
      {
        title: "Lead operator",
        badge: "A",
        verdict:
          "Confident work: the model is in place, and the few slips were on details rather than on the ideas.",
      },
      {
        title: "Field scout",
        badge: "B",
        verdict:
          "The main things landed: async, await, cancel and the line between asynchrony and concurrency.",
      },
      {
        title: "Night shift",
        badge: "C",
        verdict:
          "The base is there, the edges are shaky. A second run costs six minutes and usually doubles the score.",
      },
      {
        title: "Rookie",
        badge: "D",
        verdict:
          "You made it to the end, and that counts. Re-read the takeaways below and take the shift again — the second one goes much easier.",
      },
    ],
  },
  levels: [
    {
      id: 1,
      codename: "COLD BOOT",
      title: "Cold boot",
      story:
        "Third day with no power and no supplies. The diesel generator in the basement finally caught, " +
        "and the camp's old Zig mainframe blinked a cursor for the first time since that night. Until the " +
        "machine is up, nobody walks out the gate: the terminal cannot wait out a pause or write a single " +
        "line to the run log. Your first shift starts here, at a cold console. Bring the system up in order.",
      concept:
        "In TypeScript you build a client once — `new Pool()` for the database, a wrapper around `fetch` — " +
        "at the entry point of the app, and from there you pass it around as an argument instead of reaching " +
        "for a global singleton. Zig applies exactly that habit to input and output: the object that owns " +
        "every I/O operation is called `Io`. You assemble it once in `main()` and hand it down through your " +
        "code, the same way you hand down an `Allocator` for memory. You pick the implementation yourself: " +
        "`std.Io.Threaded` is the one that runs on ordinary OS threads. Read the line " +
        "`var threaded: std.Io.Threaded = .init(gpa)` like this: a variable of the type spelled out on the " +
        "left, and `.init(gpa)` is its constructor — the leading dot means \u00abthe type is already named\u00bb. " +
        "The big difference from Node: there is no hidden event loop at all — you plug in the I/O " +
        "implementation you want, and you shut it down just as explicitly.",
      glossary: [
        {
          token: "pub fn main() !void",
          meaning: "the entry point; `!void` means \u00abreturns nothing, or an error\u00bb — like `throws`",
        },
        {
          token: "gpa",
          meaning: "general purpose allocator — the memory allocator; in JS the garbage collector does this for you",
        },
        {
          token: ".init(gpa)",
          meaning: "a constructor call; the type is already named on the left, so the line starts with a dot",
        },
        {
          token: "defer",
          meaning: "like `finally`, but bound to the current block: it runs on any exit from it",
        },
        {
          token: "threaded.io()",
          meaning: "pull the `Io` interface out of the implementation — this is what you pass around",
        },
      ],
      referenceCode: `pub fn main() !void {
    // memory
    var debug_allocator: std.heap.DebugAllocator(.{}) = .init;
    defer assert(debug_allocator.deinit() == .ok);
    const gpa = debug_allocator.allocator();

    // the I/O implementation: plain OS threads
    var threaded: std.Io.Threaded = .init(gpa);
    defer threaded.deinit();
    const io = threaded.io();

    // hand both resources to the camp code
    return juicyMain(gpa, io);
}`,
      challenge: {
        kind: "ordering",
        prompt: "Assemble the boot procedure: put the steps in order, top to bottom.",
        items: [
          {
            id: "mem",
            label: "Bring up memory: DebugAllocator \u2192 gpa, with a defer that checks for leaks",
            hint: "The allocator comes first: the I/O implementation is built out of it — `.init(gpa)`.",
          },
          {
            id: "impl",
            label: "Bring up I/O: std.Io.Threaded = .init(gpa), then defer threaded.deinit()",
            hint: "The I/O implementation stands on memory, so it follows the allocator. Its `defer` goes right after the resource is created.",
          },
          {
            id: "iface",
            label: "Take the interface: const io = threaded.io()",
            hint: "`io` comes out of the `threaded` you just created — there is nowhere else to get it from.",
          },
          {
            id: "run",
            label: "Hand gpa and io to the camp code: juicyMain(gpa, io)",
            hint: "Handing off to the app is the last step: by then both resources are alive and cleanup is already parked on `defer`.",
          },
        ],
        correctOrder: ["mem", "impl", "iface", "run"],
        explanation:
          "Memory first, then the I/O implementation on top of it, then `io` out of that implementation, and " +
          "only at the end both resources go into the application. Every `defer` is parked right after its " +
          "resource is created, so on the way out cleanup happens in reverse order by itself. From this " +
          "minute on, every part of the camp code receives `io` as an argument — nothing magic runs in the background.",
      },
      reward: 100,
      takeaway:
        "`Io` is configured once in `main()` and passed as an argument — like an `Allocator`, not like a global event loop.",
    },
    {
      id: 2,
      codename: "FIRST RUN",
      title: "First one past the fence",
      story:
        "The terminal is alive and the log is writing. Two blocks out there is a pharmacy, and a scout with " +
        "the call sign \u00abNode\u00bb is walking to it. The run takes exactly one second: out, grab, back. While " +
        "he is in the field the mainframe should not just stand there — so launch the run in a way that keeps " +
        "the call and the wait as two separate acts.",
      concept:
        "In TypeScript, calling an async function hands you a `Promise` right away, and you put `await` where " +
        "the value is actually needed — which leaves room to do something else in between. Zig makes that " +
        "split explicit: `io.async(scoutRun, .{io})` starts `scoutRun` and immediately returns an object that " +
        "stands for the result; Zig calls it a `future`, and it is the same idea as a `Promise`. The `.{io}` " +
        "part is the argument list packed into an anonymous struct — read it as `{ io }` in JS. To collect the " +
        "result you write `scout.await(io)`: here `await` is not a keyword in front of a call but a method on " +
        "the future itself, and it takes `io` because the concrete I/O implementation decides how waiting " +
        "happens — not a global microtask scheduler. Put nothing between `async` and `await` and the behaviour " +
        "is indistinguishable from a plain synchronous call; the whole point is what you will fit in there.",
      glossary: [
        {
          token: "io.async(fn, .{args})",
          meaning: "start a function and do not wait; returns a `future` — the `Promise` analogue",
        },
        { token: ".{io}", meaning: "arguments as an anonymous struct — like `{ io }` in JS" },
        {
          token: "future",
          meaning: "an object standing for a result you will collect later; in JS you call it a `Promise`",
        },
        {
          token: ".await(io)",
          meaning: "a method on the future, not a keyword; it takes `io` because the implementation knows how to wait",
        },
        {
          token: "io.sleep(.fromSeconds(1), .awake)",
          meaning: "a pause routed through I/O; `.awake` means wake up on the timer",
        },
      ],
      challenge: {
        kind: "fill-blank",
        prompt: "Send the scout into the field, then wait for him to come back.",
        segments: [
          {
            type: "text",
            value: "fn juicyMain(gpa: Allocator, io: Io) !void {\n    _ = gpa;\n\n    var scout = ",
          },
          {
            type: "blank",
            id: "launch",
            label: "the launch",
            answer: "io.async(scoutRun, .{io})",
            options: [
              {
                value: "io.async(scoutRun, .{io})",
                feedback:
                  "Yes: `scoutRun` goes off to work and you are left holding a `future` — that is what you will collect the result with.",
              },
              {
                value: "scoutRun(io)",
                feedback:
                  "That is a plain synchronous call: execution stops right here for the whole second, and no `future` ever appears — there would be nothing left to wait for.",
              },
              {
                value: "await io.scoutRun(.{})",
                feedback:
                  "That is how you would write it in JS. In Zig `await` is not a keyword in front of a call but a method on a future, and you have to get that future from `io.async` first.",
              },
            ],
          },
          { type: "text", value: ";\n\n    " },
          {
            type: "blank",
            id: "wait",
            label: "the wait",
            answer: "scout.await(io)",
            options: [
              {
                value: "scout.await(io)",
                feedback:
                  "Right: you wait through the future itself and pass it `io` — the I/O implementation decides how the waiting is done.",
              },
              {
                value: "await scout",
                feedback:
                  "JS syntax. Zig has no global `await`: waiting is a method on the object, and it needs `io`.",
              },
              {
                value: "io.wait(scout)",
                feedback:
                  "`Io` has no such method. Waiting lives on the future, and `io` goes into it as a parameter.",
              },
            ],
          },
          {
            type: "text",
            value:
              ';\n}\n\nfn scoutRun(io: Io) void {\n    std.debug.print("past the fence\\n", .{});\n    io.sleep(.fromSeconds(1), .awake) catch {};\n}',
          },
        ],
        explanation:
          "`io.async(fn, .{args})` splits the call and the result into two different points in the code, and " +
          "`future.await(io)` brings them back together. While those points sit next to each other the program " +
          "behaves synchronously — the payoff arrives once a second run fits between them.",
      },
      reward: 150,
      takeaway:
        "`io.async` hands you a `future` (the `Promise` analogue) and `future.await(io)` collects it — the I/O implementation does the waiting, not a runtime.",
    },
    {
      id: 3,
      codename: "TWO IN THE FIELD",
      title: "Two in the field",
      story:
        "\u00abNode\u00bb came back with half a crate — not enough for the camp. So we send two at once: " +
        "\u00abNode\u00bb to the pharmacy, \u00abBun\u00bb to the depot yard. Each needs exactly one second. Back to " +
        "back that is two seconds, and something is already scraping metal outside the wall. The two runs have " +
        "to overlap.",
      concept:
        "In TypeScript the gap between `await a(); await b();` and `Promise.all([a(), b()])` is the gap between " +
        "two seconds and one: in the second version both tasks are already running and you wait for them " +
        "together. Zig does the same thing by hand: two `io.async` calls in a row, both `.await(io)` calls at " +
        "the end. Now there is real code between starting and waiting, and this is where asynchrony first pays " +
        "for itself. What happens next is up to the implementation: `std.Io.Threaded` sees the asynchrony you " +
        "expressed and spreads the tasks over threads, so two seconds of work fit into one second of real time. " +
        "Watch the order of the output too: both lines are printed before any sleeping happens, because `print` " +
        "sits at the very top of `scoutRun` and the sleep comes after it. In JS the event loop arranges all of " +
        "this for you; in Zig you express the asynchrony first, and what to do with it is the I/O " +
        "implementation's decision.",
      glossary: [
        { token: "var node = io.async(...)", meaning: "the first `future`; the run has already started" },
        { token: "[]const u8", meaning: "a string as a slice of bytes — read it as `string`" },
        { token: "{s}", meaning: "a string placeholder in `print` — like `${}` in a template literal" },
        { token: ".{scout}", meaning: "formatting arguments packed into one anonymous struct" },
      ],
      challenge: {
        kind: "timeline",
        prompt:
          "Lay out the run log: at which second does each line appear, and when does the program exit?",
        code: `fn juicyMain(gpa: Allocator, io: Io) !void {
    _ = gpa;

    var node = io.async(scoutRun, .{ io, "Node" });
    var bun = io.async(scoutRun, .{ io, "Bun" });

    node.await(io);
    bun.await(io);
}

fn scoutRun(io: Io, scout: []const u8) void {
    std.debug.print("in the field: {s}\\n", .{scout});
    io.sleep(.fromSeconds(1), .awake) catch {};
}`,
        lines: [
          {
            id: "node",
            text: "in the field: Node",
            explain:
              "`print` is the first line of `scoutRun` and the sleep comes after it. The task starts immediately, so the log entry lands at second zero.",
          },
          {
            id: "bun",
            text: "in the field: Bun",
            explain:
              "The second `io.async` does not wait for the first: both tasks are already running by the time the first `await` is reached, so the second line prints at zero as well.",
          },
        ],
        timestamps: ["0s", "1s", "2s"],
        correct: { node: "0s", bun: "0s" },
        totalSeconds: 1,
        totalOptions: [1, 2, 3],
        totalExplain:
          "Each run sleeps its own second, but they sleep at the same time — so the total is one second, not " +
          "the sum. That is the payoff you split the call and the wait for.",
        explanation:
          "Both tasks start at zero and print before sleeping, so the log fills up immediately. The sleeps " +
          "overlap and the program exits after one second instead of two. Had you put `node.await(io)` right " +
          "after the first `io.async`, the second scout would only leave once the first came back — and the " +
          "camp would lose an extra second.",
      },
      reward: 200,
      takeaway:
        "Asynchrony only pays off when there is work between `async` and `await`: two overlapping tasks take one second instead of two.",
    },
    {
      id: 4,
      codename: "THE BITE",
      title: "The bite",
      story:
        "The radio crackles: \u00abNode\u00bb hit a collapsed floor at the pharmacy and is coming back with an " +
        "error, empty-handed. \u00abBun\u00bb is copying an invoice at the depot right then — which means he has " +
        "allocated memory. You write the code the way you would write it on any other day: two `try` lines in a " +
        "row. The program does not simply return the error — it dies with SIGABRT, and not where you would expect.",
      concept:
        "`try` in Zig does not mean what it means in TypeScript. In JS `try` is about catching: " +
        "`try { \u2026 } catch (e) { \u2026 }`. In Zig `try` goes in front of an expression and means the " +
        "opposite — \u00abif this is an error, leave the function right now and pass it up\u00bb: closer to " +
        "`throw` than to `catch`. So `try node.await(io)` exits `juicyMain` on the first error, and the line " +
        "`try bun.await(io)` never runs at all. And a future is more than a value: under the hood `std.Io` " +
        "allocated a closure to run the task, and that memory is released exactly at `await`. Never reach the " +
        "`await` and the task's memory stays behind; in JS the garbage collector would sweep it up, here " +
        "`DebugAllocator` finds the leak and kills the process. Which gives the rule for this step: collect " +
        "both results first, sort out the errors after.",
      glossary: [
        {
          token: "try expression",
          meaning: "on an error, leave the function and pass it up — like `throw`, not like `catch`",
        },
        { token: "!void", meaning: "returns either nothing or an error" },
        {
          token: "error.OutOfMemory",
          meaning: "a value from an error set; in Zig errors are values, not exceptions",
        },
        { token: "gpa.dupe(u8, s)", meaning: "copy a string onto the heap; the copy has to be freed later" },
        {
          token: "task closure",
          meaning: "the memory `std.Io` allocated to run the task; `await` is what frees it",
        },
      ],
      referenceCode: `fn juicyMain(gpa: Allocator, io: Io) !void {
    var node = io.async(scoutRun, .{ gpa, io, "Node" });
    var bun = io.async(scoutRun, .{ gpa, io, "Bun" });

    try node.await(io);
    try bun.await(io);
}

fn scoutRun(gpa: Allocator, io: Io, scout: []const u8) !void {
    // collapsed floor at the pharmacy: the first scout leaves with an error
    if (scout[0] == 'N') return error.OutOfMemory;

    const note = try gpa.dupe(u8, scout);
    defer gpa.free(note);
    std.debug.print("in the field: {s}\\n", .{note});
    io.sleep(.fromSeconds(1), .awake) catch {};
}`,
      challenge: {
        kind: "choice",
        prompt: "Why does the process die on a memory leak instead of just returning the error?",
        options: [
          {
            id: "dupe",
            label: "gpa.dupe copies the invoice and nobody calls free — a missing defer",
            feedback:
              "Off target: `defer gpa.free(note)` is already there inside `scoutRun`, and that copy is released normally. The leak does not come from the task body but from what was left outside it.",
          },
          {
            id: "try-skip",
            label:
              "try on the first await exits the function, the second await never runs — and Bun's task closure is left hanging",
            feedback:
              "Exactly. `try` passes the error up immediately, the `bun.await(io)` line never executes, and it is `await` that frees the memory allocated to run the task.",
          },
          {
            id: "threaded",
            label: "std.Io.Threaded cannot hold two tasks at the same time",
            feedback:
              "No: you already ran two overlapping tasks and they finished fine. This is not about the implementation but about where control goes after the error.",
          },
          {
            id: "sleep",
            label: "io.sleep cannot be called from two tasks at once",
            feedback:
              "No, `io.sleep` is perfectly happy in several tasks. Look away from the sleep and at the line execution never reached.",
          },
        ],
        correct: "try-skip",
        explanation:
          "`try` is an early exit. The first error carries control out of `juicyMain`, the second `await` never " +
          "happens, and nobody frees the second task's closure. `DebugAllocator` spots the leak and brings the " +
          "process down. The galling part is that the code looks completely normal — exactly how you would have " +
          "written it in TypeScript.",
        fix: {
          prompt: "How do you rewrite these four lines so the error returns cleanly and nothing leaks?",
          options: [
            {
              id: "split",
              code: `const node_result = node.await(io);
const bun_result = bun.await(io);

try node_result;
try bun_result;`,
              feedback:
                "Yes: both `await` calls run unconditionally, the task memory is freed, and only then does `try` pass the first error up. The error returns cleanly and nothing leaks.",
            },
            {
              id: "free",
              code: `try node.await(io);
try bun.await(io);
defer gpa.free(note);`,
              feedback:
                "Not it: the order of the `try` lines has not changed, so control still never reaches the second `await`. On top of that `note` lives inside `scoutRun` — out here it does not exist.",
            },
            {
              id: "swallow",
              code: `if (node.await(io)) |_| {} else |_| {}
if (bun.await(io)) |_| {} else |_| {}`,
              feedback:
                "This does remove the leak, but it costs you the errors: both are swallowed silently. The camp never finds out that \u00abNode\u00bb did not come back.",
            },
          ],
          correct: "split",
          explanation:
            "Both `await` calls first — they unconditionally free the task memory — and only then `try`, which " +
            "decides what to do with the errors. It works, but it reads like a ritual that is easy to forget at " +
            "4 a.m. Next shift you will learn to write this like a human being.",
        },
      },
      reward: 250,
      takeaway:
        "`try` is an early exit (like `throw`): an `await` skipped because of it leaves the task closure unreleased.",
    },
    {
      id: 5,
      codename: "EXTRACTION",
      title: "Extraction protocol",
      story:
        "The debrief was short: if one scout is in trouble, the rest get pulled back that same second instead " +
        "of sitting out their runs. Keeping the order of `await` and `try` in your head is a bad protocol — " +
        "nobody remembers it at 4 a.m. What we need is an \u00abeveryone back\u00bb order that fires by itself on " +
        "any way out, error or not.",
      concept:
        "In TypeScript, to abort a `fetch` you create an `AbortController`, hang its `signal` on the request, " +
        "and clean up in `finally`. Zig folds both halves into one line: `defer task.cancel(io) catch {};`. Take " +
        "it apart. `cancel` is \u00aban `await` that also asks the task to stop\u00bb: same API, same result, so " +
        "it frees the task's memory too, but it signals first; together with `await` it is idempotent, so an " +
        "extra call breaks nothing. `defer` is like `finally` but for any block: the line runs when you leave " +
        "the function, including an early exit through `try`. And `catch {}` deliberately swallows the error of " +
        "the cancellation itself: what we want to send upstairs is why the run failed, not a complaint from the " +
        "cleaner. The result: you can write `try` and `await` plainly again — the moment the first task returns " +
        "an error both defers fire, and the second run is cut short instead of sitting out its second.",
      glossary: [
        {
          token: "cancel(io)",
          meaning: "an `await` that also asks the task to wind down; same API, same result",
        },
        {
          token: "idempotent",
          meaning: "`await` and `cancel` can be called repeatedly and in any mix — the effect does not double",
        },
        {
          token: "catch {}",
          meaning: "swallow the error of an expression; here, the error of the cancellation itself",
        },
        {
          token: "defer \u2026 catch {}",
          meaning: "the \u00abon the way out, cancel and do not complain\u00bb pair — your `finally` in JS",
        },
      ],
      challenge: {
        kind: "fill-blank",
        prompt: "Write the extraction protocol: both runs must wind down by themselves on any exit from the function.",
        segments: [
          {
            type: "text",
            value:
              'fn juicyMain(gpa: Allocator, io: Io) !void {\n    var node = io.async(scoutRun, .{ gpa, io, "Node" });\n    ',
          },
          {
            type: "blank",
            id: "cancel-node",
            label: "recall \u00abNode\u00bb",
            answer: "defer node.cancel(io) catch {};",
            options: [
              {
                value: "defer node.cancel(io) catch {};",
                feedback:
                  "Right: the cancellation is parked on the way out immediately after the task starts — before there is any way to leave this function with an error.",
              },
              {
                value: "defer node.await(io) catch {};",
                feedback:
                  "That removes the leak but never says \u00abeveryone back\u00bb: `await` waits for the task to honestly sit out its second. You want the same API that also asks it to stop.",
              },
              {
                value: "node.cancel(io) catch {};",
                feedback:
                  "Without `defer` the cancellation fires right here and now — the scout is recalled before he even reaches the gate. The point is for it to happen on the way out of the function.",
              },
            ],
          },
          {
            type: "text",
            value: '\n\n    var bun = io.async(scoutRun, .{ gpa, io, "Bun" });\n    ',
          },
          {
            type: "blank",
            id: "cancel-bun",
            label: "recall \u00abBun\u00bb",
            answer: "defer bun.cancel(io) catch {};",
            options: [
              {
                value: "defer bun.cancel(io) catch {};",
                feedback:
                  "Yes: the second task gets its own `defer`, and on the way out they fire in reverse order — \u00abBun\u00bb first, then \u00abNode\u00bb.",
              },
              {
                value: "try bun.cancel(io);",
                feedback:
                  "`try` would push the cancellation's own error upstairs, and in the middle of the function at that. Cleanup belongs on the way out, and its own error is swallowed on purpose.",
              },
              {
                value: "defer bun.deinit();",
                feedback:
                  "A future has no `deinit`: the task's memory is freed by `await` or `cancel` — there is no third way.",
              },
            ],
          },
          {
            type: "text",
            value:
              "\n\n    try node.await(io);\n    try bun.await(io);\n}\n\n// \u00abNode\u00bb returns an error — and \u00abBun\u00bb winds down the same second",
          },
        ],
        explanation:
          "Now `try` and `await` are written plainly, like ordinary code. The moment the first run returns an " +
          "error, control leaves the function, both defers fire, and the second task winds down immediately — " +
          "no leak, no extra second of waiting. `cancel` and `await` sharing an API is not a coincidence: it is " +
          "what lets you park the cleanup up front, before you know how any of this ends.",
      },
      reward: 300,
      takeaway:
        "`defer task.cancel(io) catch {}` is `AbortController` and `finally` in one line: no leaks and no wasted waiting.",
    },
    {
      id: 6,
      codename: "RADIO SILENCE",
      title: "Radio silence",
      story:
        "Night, the last shift. The convoy only leaves if the operator picks one message off the frequency — " +
        "the coordinates of the meeting point. The transmitter and the operator are both started through the " +
        "same familiar `io.async`, with an empty queue between them. In daylight this worked. But the generator " +
        "sagged and the thread pool was squeezed down to one — and now there is nothing on screen. No error, no " +
        "line in the log. The operator waits for a message, the transmitter waits for its turn to run, and both " +
        "will wait until sunrise.",
      concept:
        "In JS the event loop glues asynchrony and concurrency together: while the consumer sits on `await`, the " +
        "producer gets its tick and runs — you never have to think about it. In Zig these are two different " +
        "things, and what separates them is not philosophy but this exact deadlock. `io.async` only says " +
        "\u00abdo not wait right now\u00bb — it is permission to run the task later, not a promise to run it " +
        "alongside anything else. While the pool has a free thread you cannot see the difference; on a single " +
        "thread the operator takes the whole thread and sits inside `getOne`, while the transmitter stands in " +
        "the run queue and never gets there. When tasks have to run at the same time just to finish at all, ask " +
        "for it explicitly: `io.concurrent` guarantees simultaneity — `std.Io.Threaded` will even spin up a " +
        "thread beyond the pool for it. The price of that honesty is that `concurrent` is allowed to refuse: it " +
        "returns `error.ConcurrencyUnavailable` when simultaneity is impossible in principle — in a build with " +
        "`-fsingle-threaded`, for instance. That is why it is preceded by `try`.",
      glossary: [
        {
          token: "Io.Queue([]const u8)",
          meaning: "a message queue; unbuffered here — strictly hand to hand",
        },
        {
          token: "putOne / getOne",
          meaning: "put one value in / take one out; on an empty queue `getOne` blocks the task",
        },
        { token: "io.async", meaning: "\u00abno need to wait now\u00bb — asynchrony, with no promise of simultaneity" },
        { token: "io.concurrent", meaning: "\u00abthese tasks must run at the same time\u00bb — concurrency on demand" },
        {
          token: "error.ConcurrencyUnavailable",
          meaning: "an honest refusal: simultaneity is unavailable, which is why the call goes through `try`",
        },
      ],
      referenceCode: `// the thread pool is squeezed down to one
threaded.cpu_count = 1;

fn juicyMain(io: Io) !void {
    var queue: Io.Queue([]const u8) = .init(&.{});

    var radio_task = io.async(transmit, .{ io, &queue, "meeting point: depot, 04:00" });
    defer radio_task.cancel(io) catch {};

    var operator_task = io.async(receive, .{ io, &queue });
    defer _ = operator_task.cancel(io) catch {};

    const message = try operator_task.await(io);
    std.debug.print("received: {s}\\n", .{message});
}

fn transmit(io: Io, queue: *Io.Queue([]const u8), text: []const u8) !void {
    try queue.putOne(io, text);
}

fn receive(io: Io, queue: *Io.Queue([]const u8)) ![]const u8 {
    return queue.getOne(io);
}`,
      challenge: {
        kind: "choice",
        prompt: "The thread pool is one — why did everything freeze without a single error?",
        options: [
          {
            id: "queue-broken",
            label: "An unbuffered Io.Queue cannot pass values — there is nowhere to put the message",
            feedback:
              "No, the queue is fine: on several threads this very code runs and prints the message. It broke exactly when the thread count dropped.",
          },
          {
            id: "sleep-blocks",
            label: "io.sleep took the only thread while everyone else waited",
            feedback:
              "There is not a single `io.sleep` in this code. The thread is occupied not by a sleep but by a task hanging on somebody else's result.",
          },
          {
            id: "async-not-concurrent",
            label:
              "io.async gives asynchrony but not concurrency: the operator took the only thread, so the transmitter never starts",
            feedback:
              "Precisely. `io.async` permits the task to run later but promises nothing about running it alongside others — and here neither task can finish without simultaneity.",
          },
          {
            id: "order",
            label: "queue.putOne should have been called before io.async — the calls are in the wrong order",
            feedback:
              "Shuffling the lines will not save you: the problem is not the launch order but that both tasks need to run at the same time, and nothing ever guaranteed that.",
          },
        ],
        correct: "async-not-concurrent",
        explanation:
          "Asynchrony is \u00abno need to wait now\u00bb. Concurrency is \u00abthese tasks run at the same " +
          "time\u00bb. On a wide pool the difference is invisible and the code looks like it works; on one thread " +
          "it turns into a deadlock with no error and no output — the nastiest kind of failure. Here simultaneity " +
          "is not about speed: without it the program cannot finish at all.",
        fix: {
          prompt: "What do you replace the task launches with so the convoy actually leaves?",
          options: [
            {
              id: "concurrent",
              code: `var radio_task = try io.concurrent(transmit, .{
    io, &queue, "meeting point: depot, 04:00",
});
defer radio_task.cancel(io) catch {};

var operator_task = try io.concurrent(receive, .{ io, &queue });
defer _ = operator_task.cancel(io) catch {};`,
              feedback:
                "Yes: you asked for simultaneity explicitly, and `std.Io.Threaded` delivers it — spinning up a thread beyond the pool. The `try` is there because the answer may come back as `error.ConcurrencyUnavailable`.",
            },
            {
              id: "cpu-count",
              code: `var radio_task = io.async(transmit, .{
    io, &queue, "meeting point: depot, 04:00",
});
threaded.cpu_count = 2;`,
              feedback:
                "That treats the symptom: the code still hopes for a free thread instead of demanding simultaneity. Shrink the pool or build single-threaded and the deadlock is back.",
            },
            {
              id: "spawn",
              code: `var radio_task = try io.spawn(transmit, .{
    io, &queue, "meeting point: depot, 04:00",
});`,
              feedback:
                "There is no `io.spawn` in this interface. The thing you want is named differently and honestly reports a refusal when simultaneity is unavailable.",
            },
          ],
          correct: "concurrent",
          explanation:
            "Both ends of the channel start through `io.concurrent`, and the operator finally meets the " +
            "transmitter on the frequency. The rule to keep: if tasks merely speed each other up, `io.async` is " +
            "enough; if they cannot finish at all without running at the same time, it has to be `io.concurrent` — " +
            "and be ready to handle a refusal.",
        },
      },
      reward: 350,
      takeaway:
        "Asynchrony \u2260 concurrency: `io.async` permits postponing, `io.concurrent` promises simultaneity — and is allowed to refuse.",
    },
  ],
};
