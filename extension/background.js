console.log("running background.js");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "generateComment":
      chrome.storage.sync.get(["gemini-api-key"], async (result) => {
        if (!result["gemini-api-key"]) {
          console.error("No API key found");
          return false; // Return false to indicate that the response will not be sent
        }

        const comment = await generateGeminiComment(
          request.postText.slice(0, 1000),
          result["gemini-api-key"]
        );

        sendResponse({
          comment,
        });
      });

      return true; // Indicate that the response will be sent asynchronously
  }
});

async function generateGeminiComment(postCaption, geminiApiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: "You are a professional LinkedIn engagement assistant. Your task is to generate thoughtful, relevant, and engaging comments based on the caption of a LinkedIn post. Your comments should reflect a professional tone while being human, authentic, and aligned with LinkedIn best practices.",
            },
          ],
        },
        contents: [
          {
            parts: [
              {
                text: `Generate a professional short LinkedIn comment for this post: "${postCaption}"`,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();

  return data.candidates[0].content.parts[0].text.trim();
}

async function generateOpenAIComment(postCaption, openaiApiKey) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Generate a professional LinkedIn comment for this post: "${postCaption}"`,
        },
      ],
      max_tokens: 60,
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content.trim();
}
