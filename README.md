# Office Hours

Every Tuesday in the Resonite Discord, I host a 30 minute AMA/Office Hours session answering questions about Resonite.

We kept having storage, sync, processing etc issues that resultant in a loss of coverage or loss of files etc. Due to that I've just built my own.

This is an [Eleventy](https://www.11ty.dev/) site, that just spits out static HTML for each episode. You can find it live [here](https://officehours.probableprime.co.uk)

## Features
- 1 Page per episode
    - VTT file
    - SRT File
    - OGG/MP3 File
- Index page that lists episodes

### Manifests
If you're building a tool to access these episodes, then you can use the following urls to access a manifest of the episodes:
- JSON: https://officehours.probableprime.co.uk/api/manifest.json
- Game Compatible Output(Pipe separated): https://officehours.probableprime.co.uk/api/manifest.game

## Principles
- 0 JS Frameworks in the output. I'm a little perturbed when I see static site generators that output buckets of JS.
- HTML5 Stuff only, there are custom players but why use them
- KISS - Keep it Simple, I don't want anything complicated

## Suitability
I built this in about 3 hours. It has some rough spots, see the issue list for more information. 

## License 
GPL  V3.0
