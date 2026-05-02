# pi-provider-crofai

Unofficial CrofAI provider package for [pi](https://pi.dev).

CrofAI offered me a trial of their model hosting service, so I wanted to test it properly from the place I actually work every day: my Pi coding-agent harness. I could have kept a private `models.json` around, but that felt annoying and not very useful to anyone else.

So this is the small public package version. Install it, log in through Pi, and CrofAI shows up as a normal provider.

This is not an official CrofAI or Pi integration. If CrofAI and Pi work out an official provider later, that would be great. I would be happy to point people there. Until then, this package is meant to be boring, inspectable glue that helps me test CrofAI seriously and maybe helps other Pi users too.

## Install

From npm:

```bash
pi install npm:pi-provider-crofai
```

From GitHub:

```bash
pi install git:github.com/nqh-packages/pi-provider-crofai
```

From a local checkout:

```bash
pi install /absolute/path/to/pi-provider-crofai
```

## Login

Inside Pi:

```text
/login
```

Choose:

```text
Use an API key -> CrofAI
```

Pi stores the key in its normal auth file:

```text
~/.pi/agent/auth.json
```

For headless or CI runs, this also works:

```bash
export CROFAI_API_KEY="your-key"
```

Then select a model:

```text
/model
```

## What it registers

Provider ID:

```text
crofai
```

Base URL:

```text
https://crof.ai/v1
```

Pi API type:

```text
openai-completions
```

## Model list

The model list refreshes every time Pi starts or you run `/reload`.

The extension reads:

```text
https://crof.ai/pricing
```

I use the pricing page because CrofAI's `/v1/models` endpoint currently gives IDs, prices, and limits, but not the `vision` labels. Pi needs to know image support before it sends an image, so the pricing page is the better source for that part.

If the pricing page is unavailable, the extension falls back to a bundled model snapshot so `/model` still works.

## Local check

From this repo:

```bash
npm run check
```

You should see CrofAI models, including vision-capable ones like `kimi-k2.6`, `kimi-k2.5`, `gemma-4-31b-it`, and some Qwen models marked with image support.

## Notes

This package is intentionally small. No custom streaming layer, no special auth server, no extra runtime dependency.

It just registers CrofAI as an OpenAI-compatible Pi provider, pulls fresh model metadata from CrofAI's pricing page, and lets Pi handle the rest.

Docs I used:

- <https://crof.ai/docs>
- <https://crof.ai/pricing>
