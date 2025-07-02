const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const BASE = "https://api.voids.top/v1";

app.get("/", (req, res) => {
  const now = new Date().toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    hour12: true,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  res.type("text/plain").send(`
Hello, welcome to my API — Waguri API by Jay Mar

🕒 Server Time: ${now}

Sample Endpoints:
GET   /waguri/models
GET   /waguri/chat?model=gpt-4o&prompt=What+is+the+capital+of+Japan&role=user

Made with ❤️ by Jay Mar
  `.trim());
});

app.get("/waguri/models", async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE}/models`);
    const models = Array.isArray(data?.data)
      ? data.data.map(({ id, owned_by }) => ({ id, owned_by }))
      : [];
    res.json({ author: "Jay Mar", models });
  } catch (err) {
    res.status(500).json({ author: "Jay Mar", error: err.message });
  }
});

app.get("/waguri/chat", async (req, res) => {
  const { model, prompt, role } = req.query;

  if (!model || !prompt) {
    return res.status(400).json({
      author: "Jay Mar",
      error: "Missing 'model' or 'prompt'."
    });
  }

  const payload = {
    model,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: role?.trim() || "user", content: prompt }
    ]
  };

  try {
    const response = await axios.post(`${BASE}/chat/completions`, payload, {
      headers: { "Content-Type": "application/json" }
    });

    const reply = response.data?.choices?.[0]?.message?.content || "[No response]";
    res.json({ author: "Jay Mar", model, response: reply });
  } catch (err) {
    res.status(500).json({
      author: "Jay Mar",
      error: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Waguri API running at http://localhost:${PORT}`);
});
