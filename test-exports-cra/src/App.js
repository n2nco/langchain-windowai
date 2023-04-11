/* eslint-disable no-unused-vars */

// import all entrypoints to test, do not do this in your own app
import "./entrypoints.js";

// Import a few things we'll use to test the exports
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate
} from "langchain/prompts";


import { useCallback, useEffect, useState } from "react";
import { CallbackManager } from "langchain/callbacks";
import { WindowAi, ModelID } from "./WindowAi.ts"
import { DynamicTool } from "langchain/tools";
import { OpenAI } from "langchain/llms/openai";
import { initializeAgentExecutor } from "langchain/agents";
import { StructuredOutputParser } from "langchain/output_parsers";

export const demo_func = async () => {
  // With a `StructuredOutputParser` we can define a schema for the output.
  const parser = StructuredOutputParser.fromNamesAndDescriptions({
    answer: "answer to the user's question",
    source: "source used to answer the user's question, should be a website.",
  });

  const formatInstructions = parser.getFormatInstructions();

  const prompt = await new PromptTemplate({
    template:
      "Answer the users question as best as possible.\n{format_instructions}\n{question}",
    inputVariables: ["question"],
    partialVariables: { format_instructions: formatInstructions },
  });

  // const model = await new OpenAI({ temperature: 0, openAIApiKey: "sk-.... });
  const model = await new WindowAi({ completionOptions: { temperature: 0.7, maxTokens: 800, model: ModelID.GPT3 } });
  const input = await prompt.format({
    question: "What is the capital of France?",
  });
  const response = await model.call(input); //Currently WindowAi doesn't parse the output whereas OpenAI class does
  console.log(response);
}
//demo_func()

function App() {
  const [input, setInput] = useState("");
  const [llmResponses, setLlmResponses] = useState([]);
  const [modelInUse, setModelInUse] = useState("");

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault(); // prevent the default form submission behavior
      // Use the user input if available, otherwise use a default question
      const question = input ? input : "No question entered by user";
      // Create the LLM chain
      const llm = new WindowAi({ completionOptions: { temperature: 0.7, maxTokens: 800, model: ModelID.GPT3 } });
      const model = await llm.getCurrentModel();
      setModelInUse(model);

      const template = `Question: {question}.  Answer: Let's think step by step.`;
      const prompt = new PromptTemplate({ template:template, inputVariables:["question"] });
      const llm_chain = new LLMChain({ prompt:prompt, llm:llm });
      // Run the LLM chain
      const response = await llm_chain.run(input);
      // Update the state variables
      setModelInUse(model);
      setLlmResponses((prevResponses) => [...prevResponses, response]);
      // Clear the input field
      setInput("");
    },
    [input]
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>WindowAi Langchain Demo</h1>
        <p className={modelInUse ? "model detected" : "model"} style={{ color: modelInUse ? "green" : "#555" }}>Model in use: {modelInUse ? modelInUse : "not yet detected"}</p>

        <p className="subheader">Ask a question and let WindowAi guide you through the reasoning process step by step.</p>
        <a className="logo" href="https://windowai.io" target="_blank" rel="noopener noreferrer"></a>
        <form onSubmit={handleSubmit}>
          <label>
            <input type="text" className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder=" Type your question" />
          </label>
          <button type="submit" className="button">Submit</button>
        </form>
    
        <div className="responses">
          {llmResponses.map((response, index) => (
            <p key={index} className="response">{response.replace("", "")}</p>
          ))}
        </div>
      </header>
    </div>
  );
 }

// const run = async () => {
//     // const model = new OpenAI({ temperature: 0 });
//     var llm = new WindowAi({ completionOptions: { temperature: 0.7, maxTokens: 800, model: ModelID.GPT3 } })
//     const toolkit = await new OpenApiToolkit({llm: llm})

//     const executor = await initializeAgentExecutor(
//       toolkit.tools,
//       llm,
//       "zero-shot-react-description",
//       true
//     );
//     console.log("Loaded agent.");
  
//     const input = `Summarize the last email I received regarding Silicon Valley Bank. Send the summary to the #test-zapier Slack channel.`;
  
//     console.log(`Executing with input "${input}"...`);
  
//     const result = await executor.call({ input });
  
//     console.log(`Got output ${result.output}`);
//   };

// run()

export default App;


// import {
//   RequestsGetTool,
//   RequestsPostTool,
//   AIPluginTool,
// } from "langchain/tools";



// /**
//  * Retrieves an OpenAPI specification from a given plugin URL and generates a new AIPluginTool instance.
//  * @param {string} url - The URL of the AI plugin.
//  * @returns {Promise<AIPluginTool>} A promise that resolves to a new AIPluginTool instance.
// /**
//  * Retrieves an OpenAPI specification from a given plugin URL and generates a new AIPluginTool instance.
//  * @param {string} url - The URL of the AI plugin.
//  * @returns {Promise<AIPluginTool>} A promise that resolves to a new AIPluginTool instance.
//  */
//  const fromPluginUrl = async (url) => {
//   const pluginResponse = await fetch(url);

//   if (!pluginResponse.ok) {
//     throw new Error(`Failed to fetch plugin from ${url} with status ${pluginResponse.status}`);
//   }

//   const contentType = pluginResponse.headers.get("content-type");
//   var pluginJson

//   if (!contentType || !contentType.includes("application/json")) {
//     console.log(contentType)
//      pluginJson = await pluginResponse.text();
//    // throw new TypeError(`Failed to parse JSON response from ${url}: response is not JSON`);
//   }
//   else {
//   pluginJson = await pluginResponse.text();
//   }



//   const apiResponse = await fetch(pluginJson.api.url);

//   if (!apiResponse.ok) {
//     throw new Error(`Failed to fetch API spec from ${pluginJson.api.url} with status ${apiResponse.status}`);
//   }

//   const apiText = await apiResponse.text();

//   // log the response body to see if there are any issues
//   console.log(apiText);

//   const apiJson = JSON.parse(apiText);

//   const description = `Call this tool to get the OpenAPI spec (and usage guide) for interacting with the ${pluginJson.name_for_human} API. You should only call this ONCE! What is the ${pluginJson.name_for_human} API useful for? ${pluginJson.description_for_human}`;
//   const apiSpec = `Usage Guide: ${pluginJson.description_for_model}\n\nOpenAPI Spec: ${apiText}`;
//   const toolName = pluginJson.name_for_model;

//   return new AIPluginTool({
//     name: toolName,
//     description: description,
//     apiSpec: apiSpec
//   });
// };
