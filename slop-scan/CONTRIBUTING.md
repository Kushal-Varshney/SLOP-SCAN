# contributing

hey, thanks for wanting to help. here's the quick version.

## setup

```bash
git clone https://github.com/your-username/slop-scan.git
cd slop-scan
npm install
npm run dev
```

that's it. no env vars, no database, no API keys.

## where to start

**easiest wins:**
- add more filler phrases to `src/lib/data/filler-phrases.ts` — if you've seen ChatGPT say something cringy, add it to the list
- add AI-associated words to `src/lib/data/ai-vocabulary.ts` — think "delve", "tapestry", "multifaceted"
- add test cases to `src/data/datasets/all-tracks.json` — the more labeled data, the better

**if you want to go deeper:**
- the core analyzers live in `src/lib/engine/core/`. each one is independent, so you can tweak one without breaking others
- the scoring weights in `composite-scorer.ts` are the most sensitive part — change them carefully and run the full test suite after
- track analyzers in `src/lib/engine/tracks/` are domain-specific. if you know a domain well (e.g. you review a lot of PRs), you probably know patterns we're missing

## making changes

1. make a branch
2. do your thing
3. run `npx tsc --noEmit` to check types
4. run `npm run build` to make sure nothing explodes
5. open a PR with what you changed and why

## code style

- typescript, strict mode
- vanilla CSS (no tailwind)
- comments should explain *why*, not *what*
- if you're adding a threshold or magic number, leave a comment about where it came from

## reporting bugs

if something gets misclassified, open an issue with:
- the text that was wrong
- what it scored vs what it should have scored
- which track you were using (if any)

## license

MIT. your contributions will be too.
