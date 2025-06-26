console.log("running background.js");

const API_KEY = "";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateComment") {
    // const { postText } = request;
    // chrome.storage.sync.get(["openaiApiKey"], async (result) => {
    //   const response = await fetch(
    //     "https://api.openai.com/v1/chat/completions",
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${result.openaiApiKey}`,
    //       },
    //       body: JSON.stringify({
    //         model: "gpt-3.5-turbo",
    //         messages: [
    //           {
    //             role: "user",
    //             content: `Generate a professional LinkedIn comment for this post: "${postText.substring(
    //               0,
    //               1000
    //             )}"`,
    //           },
    //         ],
    //         max_tokens: 60,
    //       }),
    //     }
    //   );

    //   const data = await response.json();
    //   sendResponse({ comment: data.choices[0].message.content.trim() });
    // });

    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a professional short LinkedIn comment for this post: "${request.postText.substring(
                    0,
                    1000
                  )}"`,
                },
              ],
            },
          ],
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        sendResponse({
          comment: data.candidates[0].content.parts[0].text.trim(),
        });
      });

    return true; // Keeps message channel open
  }
});
