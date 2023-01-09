const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports = async function getFitnessInstructorResponse(question, user) {
  const completion = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: `I want you to act as a fitness coach and answer the question, "${question}"`,
    echo: false,
    max_tokens: 1024,
    temperature: 0.7,
    n: 1,
    best_of: 1,
    user
  }).catch(() => null);

  return completion ? completion.data.choices[0].text : null;
}