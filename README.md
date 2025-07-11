# Voice-Guided Email Assistant 

A voice-driven Chrome extension that enables users to speak in Hindi and automatically generates professional emails in English. Designed with a Gmail-like UI, the extension supports live recording, tone customization, and direct insertion into Gmail drafts.

##  Features

-  **Live Voice Input**: Record your Hindi message with a single click.
-  **Google Speech-to-Text**: Transcribes Hindi audio into text using Google's API.
-  **Gemini Integration**: Automatically translates and formats your text into a polished English email in a tone of your choice (formal, casual, urgency).
-  **Auto Gmail Insert**: Preview the email and directly open Gmail with subject and body prefilled.
-  **15-second Countdown Timer**: Visual timer with stop button for better control.
-  **Gmail-Like UI**: Styled to resemble Gmail’s dark theme for a familiar experience.

##  Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Chrome Extension)
- **Backend**: Flask (Python)
- **APIs**: Google Speech-to-Text API, Gemini API


## Getting Started (Local Setup)

### 1. Clone the Repo

- git clone https://github.com/khushii-o5/speech-email-automation.git
- cd speech-email-automation

### 2. Backend Setup

- cd flask-backend
- Install dependencies :
pip install -r requirements.txt

### 3. Add Environment Variables

Create a .env file in flask-backend:

- GOOGLE_SPEECH_API_KEY=your_google_api_key_here
- GEMINI_API_KEY=your_gemini_api_key_here
- (Don't commit .env — it’s already added to .gitignore.)

### 4. Run the Backend Server

python app.py

### 5. Chrome Extension Setup
   
- Go to chrome://extensions/
- Enable Developer Mode
- Click Load Unpacked
- Select the chrome-extension folder

### Note

- Requires active internet to call Google & Gemini APIs
- Not deployed to Chrome Web Store yet
- Backend must be running locally for full functionality


##  Status

 This project is **under active development**. The extension is functional locally and will be deployed on the Chrome Web Store.
