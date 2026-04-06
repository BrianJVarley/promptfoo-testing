const dotenv = require("dotenv");
const Groq = require("groq-sdk");
const path = require("path");


// Explicit path prevents working-directory issues
dotenv.config({ path: path.resolve(__dirname, ".env") });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function groqCompoundPrompt(prompt) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "compound-beta",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null,
      compound_custom: {
        tools: {
          enabled_tools: ["web_search", "code_interpreter", "visit_website"],
        },
      },
    });

    let response = "";
    for await (const chunk of chatCompletion) {
      response += chunk.choices[0]?.delta?.content || "";
    }
    return response;
  } catch (error) {
    console.error("Error fetching chat completion:", error);
    return "";
  }
}

class GroqCompound {
  constructor(options) {
    this.providerId = options.id || "groq-compound";
    this.config = options.config;
  }

  id() {
    return this.providerId;
  }

  async callApi(prompt, context) {
    const response = await groqCompoundPrompt(prompt);
    const totalLen = response.length;
    const promptLen = prompt.length;
    const completionLen = totalLen - promptLen;
    return {
      id: this.providerId,
      output: response,
      tokenUsage: {
        total: totalLen,
        prompt: promptLen,
        completion: completionLen,
      },
    };
  }
}

module.exports = GroqCompound;
