console.log("feed page content script");

let processing = false;

// Detect new posts in feed
const observer = new MutationObserver(() => {
  if (processing) return;
  processPosts();
});

observer.observe(document, { childList: true, subtree: true });

async function processPosts() {
  processing = true;

  const posts = document.querySelectorAll(".feed-shared-update-v2");

  for (const post of posts) {
    if (post.dataset.processed) continue;
    post.dataset.processed = "true";

    try {
      const postText = post.querySelector(
        ".update-components-text > span > span"
      ).innerText;
      const commentBtn = post.querySelector("button[aria-label='Comment']");

      console.log("Processing post:", postText);

      if (commentBtn) {
        const { comment } = await chrome.runtime.sendMessage({
          action: "generateComment",
          postText: postText,
        });

        // Store generated comment
        post.dataset.generatedComment = comment;

        // Modify comment button
        commentBtn.addEventListener("click", () => {
          setTimeout(() => injectComment(post), 500);
        });
      }
    } catch (error) {
      console.log("Error processing post:", error);
    }
  }

  processing = false;
}

function injectComment(post) {
  const commentBox = document.querySelector(".ql-editor.ql-blank");
  if (commentBox && post.dataset.generatedComment) {
    commentBox.innerHTML = post.dataset.generatedComment;

    // Dispatch input event for LinkedIn's internal tracking
    const event = new Event("input", { bubbles: true });
    commentBox.dispatchEvent(event);
  }
}
