const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chatCompletion = await groq.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "",
    },
  ],
  model: "groq/compound",
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

for await (const chunk of chatCompletion) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
