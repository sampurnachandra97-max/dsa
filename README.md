# AlgoLab

A Next.js practice site for data structures and algorithms. Browse problems by topic and difficulty. Each problem has its own workspace URL with an editor and terminal. The Course Content section maps the five syllabus units to exercises.

- The browser JavaScript mode calls the problem's `solve` function directly. **Run examples** checks the public examples and prints console output in the terminal.
- Other language modes, including Python, C, C++, Java, TypeScript, C#, and Rust, run through Wandbox. **Run program** sends the code and custom stdin to the compiler, and the terminal displays standard output, diagnostics, and exit status.
- **Submit solution** checks the full test set. In Wandbox modes, write a complete program that reads one JSON array of arguments from stdin and prints one JSON value to stdout. Use stderr for debug logging.
- Drafts are saved per language in this browser, along with bookmarks and solved progress.
- **Open in LeetCode** opens the corresponding problem. Use **Copy code** and adapt the solution to LeetCode's template before submitting there.

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Run `npm run build` to create the static site in `out/`.
