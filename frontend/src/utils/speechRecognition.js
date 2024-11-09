class SpeechRec {
  constructor() {
    this.recognizer = null;
    this.interimTranscript = "";
    this.finalTranscript = "";
    this.isListening = false;
  }

  startListening(onSoundEnd, onResult) {
    const sr =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition ||
      window.oSpeechRecognition;

    this.recognizer = new sr();
    this.recognizer.continuous = false;
    this.recognizer.lang = "en-US";
    this.recognizer.interimResults = true;
    this.recognizer.maxAlternatives = 1;

    this.recognizer.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          // If result is final, add it to the final transcript
          this.finalTranscript += event.results[i][0].transcript;
        } else {
          // If result is interim, keep updating the interim transcript
          this.interimTranscript = event.results[i][0].transcript;
        }
      }

      console.log("this.finalTranscript", this.finalTranscript);
      console.log("this.interimTranscript", this.interimTranscript);

      onResult(this.interimTranscript);
    };

    this.recognizer.onsoundend = () => {
      if (this.isListening) {
        this.recognizer.start();
      }
    };

    console.log("this.recognizer", this.recognizer);
    this.recognizer.start();
    this.isListening = true;
  }

  stopListening() {
    this.recognizer.stop();
    this.isListening = false;
  }
}

export default SpeechRec;
