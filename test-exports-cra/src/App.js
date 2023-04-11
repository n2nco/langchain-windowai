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
// import { initializeAgentExecutor, ZapierToolKit, OpenApiToolkit } from "langchain/agents";
// import { ZapierNLAWrapper } from "langchain/tools";

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
      const template = `Question: {question}.  Answer: Let's think step by step.`;
      const prompt = new PromptTemplate({ template:template, inputVariables:["question"] });

      //Simplr call example for testing:
      // var r = await llm._call("where is vancouver")
      // setLlmResponses((prevResponses) => [...prevResponses, r]);

      const llm_chain = new LLMChain({ prompt:prompt, llm:llm });
      // Run the LLM chain
      const response = await llm_chain.run(input);
      // Update the state variables
      const model = await llm.getCurrentModel();
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
            <p key={index} className="response">{response}</p>
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
