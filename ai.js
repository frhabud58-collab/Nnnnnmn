
import axios from "axios";

export async function askAI(msg, data, key) {
  const r = await axios.post(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    {
      contents: [{ parts: [{ text: data + "\nUser: " + msg }] }]
    },
    { params: { key } }
  );
  return r.data.candidates[0].content.parts[0].text;
}
