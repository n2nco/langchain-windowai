import { BaseLanguageModel } from "../../base_language/index.js";
import { LLMChain } from "../llm_chain.js";
import { BasePromptTemplate } from "../../prompts/base.js";
import {
  StuffDocumentsChain,
  MapReduceDocumentsChain,
} from "../combine_docs_chain.js";
import { DEFAULT_PROMPT } from "./stuff_prompts.js";

interface summarizationChainParams {
  prompt?: BasePromptTemplate;
  combineMapPrompt?: BasePromptTemplate;
  combinePrompt?: BasePromptTemplate;
  type?: "map_reduce" | "stuff";
}
export const loadSummarizationChain = (
  llm: BaseLanguageModel,
  params: summarizationChainParams = {}
) => {
  const {
    prompt = DEFAULT_PROMPT,
    combineMapPrompt = DEFAULT_PROMPT,
    combinePrompt = DEFAULT_PROMPT,
    type = "map_reduce",
  } = params;
  if (type === "stuff") {
    const llmChain = new LLMChain({ prompt, llm });
    const chain = new StuffDocumentsChain({
      llmChain,
      documentVariableName: "text",
    });
    return chain;
  }
  if (type === "map_reduce") {
    const llmChain = new LLMChain({ prompt: combineMapPrompt, llm });
    const combineLLMChain = new LLMChain({ prompt: combinePrompt, llm });
    const combineDocumentChain = new StuffDocumentsChain({
      llmChain: combineLLMChain,
      documentVariableName: "text",
    });
    const chain = new MapReduceDocumentsChain({
      llmChain,
      combineDocumentChain,
      documentVariableName: "text",
    });
    return chain;
  }
  throw new Error(`Invalid _type: ${type}`);
};
