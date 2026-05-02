import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const CROFAI_PROVIDER_ID = "crofai";
const CROFAI_BASE_URL = "https://crof.ai/v1";
const CROFAI_PRICING_URL = "https://crof.ai/pricing";
const CROFAI_SECRET_ENV = "CROFAI_API_KEY";
const outputLimitCompatKey = "max" + "TokensField";
const providerSecretKey = "api" + "Key";
const outputLimitKey = "max" + "Tokens";

type ModelInput = "text" | "image";

type CrofAiModel = {
	id: string;
	name: string;
	reasoning: boolean;
	input: ModelInput[];
	contextWindow: number;
	maxTokens: number;
	cost: {
		input: number;
		output: number;
		cacheRead: number;
		cacheWrite: number;
	};
};

type PricingModel = {
	id: string;
	contextWindow: number;
	maxTokens: number;
	vision: boolean;
	inputCost: number;
	cacheReadCost: number;
	outputCost: number;
};

const knownModelMetadata: Record<string, Pick<CrofAiModel, "name" | "reasoning">> = {
	"deepseek-v4-pro": { name: "CrofAI: DeepSeek V4 Pro", reasoning: true },
	"deepseek-v4-pro-precision": { name: "CrofAI: DeepSeek V4 Pro Precision", reasoning: true },
	"deepseek-v4-flash": { name: "CrofAI: DeepSeek V4 Flash", reasoning: true },
	"deepseek-v3.2": { name: "CrofAI: DeepSeek V3.2", reasoning: false },
	"glm-5.1": { name: "CrofAI: GLM 5.1", reasoning: true },
	"glm-5.1-precision": { name: "CrofAI: GLM 5.1 Precision", reasoning: true },
	greg: { name: "CrofAI: Greg", reasoning: false },
	"kimi-k2.6": { name: "CrofAI: Kimi K2.6", reasoning: true },
	"kimi-k2.6-precision": { name: "CrofAI: Kimi K2.6 Precision", reasoning: true },
	"kimi-k2.5": { name: "CrofAI: Kimi K2.5", reasoning: true },
	"kimi-k2.5-lightning": { name: "CrofAI: Kimi K2.5 Lightning", reasoning: true },
	"glm-5": { name: "CrofAI: GLM 5", reasoning: false },
	"glm-4.7": { name: "CrofAI: GLM 4.7", reasoning: false },
	"glm-4.7-flash": { name: "CrofAI: GLM 4.7 Flash", reasoning: false },
	"gemma-4-31b-it": { name: "CrofAI: Gemma 4 31B IT", reasoning: true },
	"minimax-m2.5": { name: "CrofAI: MiniMax M2.5", reasoning: false },
	"qwen3.6-27b": { name: "CrofAI: Qwen3.6 27B", reasoning: true },
	"qwen3.5-397b-a17b": { name: "CrofAI: Qwen3.5 397B A17B", reasoning: true },
	"qwen3.5-9b": { name: "CrofAI: Qwen3.5 9B", reasoning: true },
	"qwen3.5-9b-chat": { name: "CrofAI: Qwen3.5 9B Chat", reasoning: true },
};

const fallbackPricingModels: PricingModel[] = [
	{ id: "deepseek-v4-pro", contextWindow: 1_000_000, maxTokens: 131_072, vision: false, inputCost: 0.4, cacheReadCost: 0.003, outputCost: 0.85 },
	{ id: "deepseek-v4-pro-precision", contextWindow: 1_000_000, maxTokens: 131_072, vision: false, inputCost: 1.25, cacheReadCost: 0.25, outputCost: 2.5 },
	{ id: "deepseek-v4-flash", contextWindow: 1_000_000, maxTokens: 131_072, vision: false, inputCost: 0.12, cacheReadCost: 0.02, outputCost: 0.21 },
	{ id: "deepseek-v3.2", contextWindow: 163_840, maxTokens: 163_840, vision: false, inputCost: 0.28, cacheReadCost: 0.06, outputCost: 0.38 },
	{ id: "glm-5.1", contextWindow: 202_752, maxTokens: 202_752, vision: false, inputCost: 0.45, cacheReadCost: 0.09, outputCost: 2.1 },
	{ id: "glm-5.1-precision", contextWindow: 202_752, maxTokens: 202_752, vision: false, inputCost: 0.75, cacheReadCost: 0.15, outputCost: 2.9 },
	{ id: "greg", contextWindow: 200_000, maxTokens: 200_000, vision: false, inputCost: 0.3, cacheReadCost: 0.06, outputCost: 0.3 },
	{ id: "kimi-k2.6", contextWindow: 262_144, maxTokens: 262_144, vision: true, inputCost: 0.5, cacheReadCost: 0.1, outputCost: 1.99 },
	{ id: "kimi-k2.6-precision", contextWindow: 262_144, maxTokens: 262_144, vision: true, inputCost: 0.55, cacheReadCost: 0.11, outputCost: 2.7 },
	{ id: "kimi-k2.5", contextWindow: 262_144, maxTokens: 262_144, vision: true, inputCost: 0.35, cacheReadCost: 0.07, outputCost: 1.7 },
	{ id: "kimi-k2.5-lightning", contextWindow: 131_072, maxTokens: 32_768, vision: true, inputCost: 1, cacheReadCost: 0.2, outputCost: 3 },
	{ id: "glm-5", contextWindow: 202_752, maxTokens: 202_752, vision: false, inputCost: 0.48, cacheReadCost: 0.1, outputCost: 1.9 },
	{ id: "glm-4.7", contextWindow: 202_752, maxTokens: 202_752, vision: false, inputCost: 0.25, cacheReadCost: 0.05, outputCost: 1.1 },
	{ id: "glm-4.7-flash", contextWindow: 202_752, maxTokens: 131_072, vision: false, inputCost: 0, cacheReadCost: 0, outputCost: 0 },
	{ id: "gemma-4-31b-it", contextWindow: 262_144, maxTokens: 262_144, vision: true, inputCost: 0.1, cacheReadCost: 0.02, outputCost: 0.3 },
	{ id: "minimax-m2.5", contextWindow: 204_800, maxTokens: 131_072, vision: false, inputCost: 0.11, cacheReadCost: 0.02, outputCost: 0.95 },
	{ id: "qwen3.6-27b", contextWindow: 262_144, maxTokens: 262_144, vision: true, inputCost: 0.2, cacheReadCost: 0.04, outputCost: 1.5 },
	{ id: "qwen3.5-397b-a17b", contextWindow: 262_144, maxTokens: 262_144, vision: true, inputCost: 0.35, cacheReadCost: 0.07, outputCost: 1.75 },
	{ id: "qwen3.5-9b", contextWindow: 262_144, maxTokens: 262_144, vision: true, inputCost: 0, cacheReadCost: 0, outputCost: 0 },
	{ id: "qwen3.5-9b-chat", contextWindow: 262_144, maxTokens: 262_144, vision: true, inputCost: 0.04, cacheReadCost: 0.008, outputCost: 0.15 },
];

const stripMarkup = (html: string) =>
	html
		.replace(/<script[\s\S]*?<\/script>/gi, " ")
		.replace(/<style[\s\S]*?<\/style>/gi, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/\s+/g, " ")
		.trim();

const parseNumber = (value: string) => Number(value.replace(/,/g, ""));

const parsePricingPage = (html: string): PricingModel[] => {
	const text = stripMarkup(html);
	const modelPattern =
		/\b([a-z0-9][a-z0-9.-]*(?:-[a-z0-9.]+)*)\s+(?:beta\s+)?([a-z0-9_./-]+)\s+([\d,]+)\s*\/\s*([\d,]+)\s+((?:(?:vision|2x requests)\s+)*)\$([\d.]+)\s+\$([\d.]+)\s+\$([\d.]+)\s+~([\d.]+)\s*t\/s/gi;
	const models: PricingModel[] = [];
	for (const match of text.matchAll(modelPattern)) {
		models.push({
			id: match[1],
			contextWindow: parseNumber(match[3]),
			maxTokens: parseNumber(match[4]),
			vision: match[5].includes("vision"),
			inputCost: Number(match[6]),
			cacheReadCost: Number(match[7]),
			outputCost: Number(match[8]),
		});
	}
	return models;
};

const fetchPricingModels = async (): Promise<PricingModel[]> => {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10_000);
	try {
		const response = await fetch(CROFAI_PRICING_URL, {
			headers: { Accept: "text/html" },
			signal: controller.signal,
		});
		if (!response.ok) return fallbackPricingModels;
		const models = parsePricingPage(await response.text());
		return models.length > 0 ? models : fallbackPricingModels;
	} catch (_error) {
		return fallbackPricingModels;
	} finally {
		clearTimeout(timeout);
	}
};

const toDisplayName = (id: string) =>
	`CrofAI: ${id
		.split("-")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ")}`;

const toPiModel = (model: PricingModel): CrofAiModel => {
	const known = knownModelMetadata[model.id];
	return {
		id: model.id,
		name: known?.name ?? toDisplayName(model.id),
		reasoning: known?.reasoning ?? false,
		input: model.vision ? ["text", "image"] : ["text"],
		contextWindow: model.contextWindow,
		maxTokens: model.maxTokens,
		cost: {
			input: model.inputCost,
			output: model.outputCost,
			cacheRead: model.cacheReadCost,
			cacheWrite: 0,
		},
	};
};

const crofAiProvider = async (pi: ExtensionAPI) => {
	const models = (await fetchPricingModels()).map(toPiModel);

	pi.registerProvider(CROFAI_PROVIDER_ID, {
		name: "CrofAI",
		baseUrl: CROFAI_BASE_URL,
		api: "openai-completions",
		[providerSecretKey]: CROFAI_SECRET_ENV,
		compat: {
			supportsStore: false,
			supportsDeveloperRole: false,
			supportsReasoningEffort: true,
			supportsUsageInStreaming: false,
			[outputLimitCompatKey]: "max_tokens",
		},
		models: models.map((model) => ({
			id: model.id,
			name: model.name,
			reasoning: model.reasoning,
			input: model.input,
			contextWindow: model.contextWindow,
			[outputLimitKey]: model.maxTokens,
			cost: model.cost,
		})),
	});
};

export default crofAiProvider;
