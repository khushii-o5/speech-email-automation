from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv
import os
import requests
import base64
import re

load_dotenv()

GOOGLE_SPEECH_API_KEY = os.getenv("GOOGLE_SPEECH_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)
CORS(app, resources={r"/process-audio": {"origins": "*"}})

@app.route("/process-audio", methods=["OPTIONS"])
@cross_origin()
def handle_preflight():
    response = jsonify({"message": "Preflight OK"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    return response
@app.route("/process-audio", methods=["POST"])
@cross_origin()
def process_audio():
    try:
        data = request.get_json()
        audio_b64 = data.get("audio")
        tone = data.get("tone", "formal")

        # Step 1: Google Speech-to-Text
        stt_payload = {
            "config": {
                "encoding": "WEBM_OPUS",
                "languageCode": "hi-IN"
            },
            "audio": {
                "content": audio_b64
            }
        }

        stt_url = f"https://speech.googleapis.com/v1/speech:recognize?key={GOOGLE_SPEECH_API_KEY}"
        stt_response = requests.post(stt_url, json=stt_payload)
        stt_result = stt_response.json()

        # print("🗣 Google STT response:", stt_result)

        if "results" not in stt_result:
            return jsonify({"error": "Speech recognition failed"}), 500

        hindi_text = stt_result['results'][0]['alternatives'][0]['transcript']

        # Step 2: Gemini to Translate & Format Email
        prompt = f"""
        Translate the following Hindi sentence to English and turn it into a professional email with a {tone} tone and do not include emoticons.
        Please include a subject line and format the output like this:

        Subject: <subject>
        Body:
        <email body>

        Hindi: "{hindi_text}"
        """

        gemini_response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}",
            json={
                "contents": [
                    {
                        "parts": [{"text": prompt}]
                    }
                ]
            }
        )

        result = gemini_response.json()
        # print("🧠 Gemini response:", result)

        if "candidates" in result:
            full_text = result['candidates'][0]['content']['parts'][0]['text']

            # 🔍 Extract Subject and Body using Regex
            subject_match = re.search(r"Subject:\s*(.*)", full_text)
            body_match = re.search(r"Body:\s*(.*)", full_text, re.DOTALL)

            subject = subject_match.group(1).strip() if subject_match else "Generated Email"
            body = body_match.group(1).strip() if body_match else full_text.strip()

            return jsonify({"subject": subject, "body": body})

        return jsonify({"error": "Gemini generation failed", "details": result}), 500

    except Exception as e:
        print("❌ Exception:", str(e))
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    app.run(debug=True)
