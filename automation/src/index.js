require("dotenv").config();
const puppeteer = require("puppeteer");
const { linkedinCookies } = require("./config");
const { delay } = require("./helper");
const fs = require("node:fs/promises");
const path = require("node:path");

async function scrapConnections(linkedinCookies) {
  const url = `https://www.linkedin.com/search/results/people/?network=["F"]&origin=MEMBER_PROFILE_CANNED_SEARCH`;

  const browser = await puppeteer.launch({ headless: true });
  await browser.setCookie(...linkedinCookies);
  const page = await browser.newPage();

  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  let currentPage = 99;
  const scrapTimestamp = new Date();

  let connections = [];

  console.log("Scraping connections...");

  while (true) {
    await page.goto(`${url}&page=${currentPage}`, {
      // networkidle2 is not working here, no idea maybe linkedin is preventing scraping
      waitUntil: "domcontentloaded",
    });

    // delay for ~ seconds
    // make it organic🫣
    await delay(3);

    const html = await page.content();
    if (html.includes("No results found")) {
      currentPage -= 1;
      console.log("No more connections...");
      break;
    }

    // scraping logic
    await page.waitForSelector("ul[role=list]>li");

    const data = await page.evaluate(() => {
      const results = [];
      const items = document.querySelectorAll("ul[role=list]>li");

      items.forEach((item) => {
        const imgEl = item.querySelector("img");
        const anchorEl = item.querySelector("a");
        const nameEl = item.querySelector("a>span>span");

        results.push({
          image: imgEl ? imgEl.src : null,
          name: nameEl ? nameEl.innerText.trim() : null,
          profile: anchorEl ? anchorEl.href?.split("?")[0] : null,
        });
      });

      return results;
    });

    console.log(
      `✅ Scraped page ${currentPage} with ${data.length} connections`
    );

    connections.push(...data);

    console.log("Sleeping for 10 seconds...");
    await delay(10);

    currentPage += 1;
  }

  console.log(
    `✅ Scraped ${connections.length} connections\ntotal time: ${
      Date.now() - scrapTimestamp
    }ms 🎉\nTotal Pages: ${currentPage}`
  );

  // append timestamp
  connections = connections.map((connection) => ({
    ...connection,
    timestamp: scrapTimestamp,
  }));

  // ! prepend usama for testing purpose, TEMP REMOVE IT⚠️⚠️
  connections.unshift({
    image:
      "https://media.licdn.com/dms/image/v2/D4D35AQHnmb2PtTHxWw/profile-framedphoto-shrink_100_100/B4DZYmTsnZG8Ao-/0/1744399420144?e=1751472000&v=beta&t=rXaba4l1Wj8FcJeaGgyaxy9ceLOEmdhO_jsY_Kg-4b0",
    name: "Usama Ahmed",
    profile: "https://www.linkedin.com/in/usamabinkashif",
    timestamp: scrapTimestamp,
  });

  await fs.writeFile(
    path.join(__dirname, "./data/connections.json"),
    JSON.stringify(connections, null, 2) + "\n"
  );

  console.log("Done");

  await browser.close();
}

scrapConnections(linkedinCookies);
