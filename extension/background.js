console.log("running background.js");

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

    const comment = `This is a generated comment for a Linkedin post, later generative ai will be used for real response::: post: 
    ${request.postText.slice(0, 100)}`;
    console.log("sending response");
    sendResponse({ comment });

    return true; // Keeps message channel open
  }
});
