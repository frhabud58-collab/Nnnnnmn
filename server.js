
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const CONFIG_PATH = "./data/config.json";
const KNOWLEDGE_PATH = "./data/knowledge.json";

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH));
}

function saveConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}

function loadKnowledge() {
  return JSON.parse(fs.readFileSync(KNOWLEDGE_PATH));
}

app.get("/", (req, res) => {
  res.send("WhatsApp AI Platform READY");
});

// save API keys
app.post("/api/config", (req, res) => {
  saveConfig(req.body);
  res.json({ success: true });
});

// upload knowledge
app.post("/api/knowledge", (req, res) => {
  fs.writeFileSync(KNOWLEDGE_PATH, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

// webhook verify
app.get("/webhook", (req, res) => {
  const config = loadConfig();
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// webhook receive
app.post("/webhook", async (req, res) => {
  try {
    const config = loadConfig();
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body || "";

    const knowledge = loadKnowledge();
    let answer = "لم يتم العثور على إجابة";

    for (let item of knowledge) {
      if (text.includes(item.question)) {
        answer = item.answer;
        break;
      }
    }

    await fetch(
      `https://graph.facebook.com/v18.0/${config.PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: { body: answer },
        }),
      }
    );

    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
