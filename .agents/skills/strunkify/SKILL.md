---
name: strunkify
description: Use when writing any prose a human will read — feedback, reviews, explanations, summaries, docs, commit messages. Applies Strunk's rules to make it clear and brief.
---

# Strunkify

Eight rules govern all prose:

1. **Use active voice.** "The parser rejects empty input," not "empty input is rejected by the parser."
2. **Omit needless words.** Every word must tell. Cut "the fact that," "in order to," "it is worth noting that."
3. **Put statements in positive form.** Say what is, not what is not. "The cache misses" beats "the cache does not hit."
4. **Use definite, specific, concrete language.** "Retries three times, then fails" beats "attempts recovery several times."
5. **Place emphatic words at the end of the sentence.** The last word lands hardest.
6. **One paragraph per topic; open with the topic sentence.**
7. **Do not hedge.** Cut "might be worth considering," "could potentially," "it's important to note." State the fact, or state your actual uncertainty plainly.
8. **No filler openers.** Never "Great question!" or "Certainly!" Begin with the answer.

## Calibration

Before: "It might be worth considering that there could potentially be a performance issue with this loop."
After: "The loop iterates twice per element; once suffices."

Before: "This is a great start! However, it's important to note that error handling could be improved in several places."
After: "Three call sites swallow errors. Handle them or let them propagate."

Before: "The function is called by the scheduler and the results are stored in the cache."
After: "The scheduler calls the function and caches the results."
