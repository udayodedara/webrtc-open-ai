import { useCallback, useEffect, useState } from "react";
import { useSpeechSynthesis } from "react-speech-kit";
// import SpeechRecognition, {
//   useSpeechRecognition,
// } from "react-speech-recognition";
import { useReactMediaRecorder } from "react-media-recorder";

import { Speaker } from "../assets/svg";
import utils from "../utils/utils";
import SpeechRecognition from "../utils/speechRecognition";

const socket = new WebSocket("ws://localhost:8080");
const speechRec = new SpeechRecognition();

const VoiceChat = () => {
  const [messages, setMessages] = useState([]);
  const { speak, voices, cancel } = useSpeechSynthesis();
  const [vidRecordings, setVidRecordings] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  console.log("vidRecordings", vidRecordings);

  const handleStopVideoRecording = (blobUrl, blob) => {
    setVidRecordings((prev) => [...prev, { vdoSrc: blobUrl, vdoBlob: blob }]);
  };

  // const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const { startRecording, stopRecording, status } = useReactMediaRecorder({
    screen: true,
    onStop: handleStopVideoRecording,
  });
  console.log("media recorder status", status);

  const handleStop = () => {
    // stopRecording();
    setIsListening(false);
    speechRec.stopListening();
    // const newObj = { message: transcript, type: "client" };
    // setMessages((prev) => [...prev, newObj]);

    // console.log("userInput", transcript);
    // socket.send(transcript);
    // resetTranscript();
  };

  const handleTTS = useCallback(
    (txt) => {
      console.log("txt", txt);
      const femaleVoice = voices.find(
        (voice) => voice.name === "Google UK English Female"
      );
      console.log("femaleVoice", femaleVoice);
      if (femaleVoice) {
        speak({ text: txt, voice: femaleVoice });
      } else {
        speak({ text: txt });
      }
      cancel();
    },
    [speak, voices, cancel]
  );

  const onSoundEnd = (eve) => {
    // speechRec.startListening(onSoundEnd);
    console.log("eve", eve);
    console.log("handleSoundPause");
    const newObj = { message: speechRec.interimTranscript, type: "client" };
    setMessages((prev) => [...prev, newObj]);

    console.log("speechRec.interimTranscript", speechRec.interimTranscript);
    socket.send(speechRec.finalTranscript);
  };

  const onResult = (result) => {
    setUserInput(result);
  };

  const handleSpeaking = () => {
    setIsListening(true);
    speechRec.startListening(onSoundEnd, onResult);
  };

  const handleStartScreenRecording = () => {
    startRecording();
  };

  const handleStopScreenRecording = () => {
    stopRecording();
  };

  useEffect(() => {
    // ws.on("error", console.error);

    socket.onopen = (event) => {
      console.log("open event", event);
      socket.send("Hello Server!");
    };

    socket.onmessage = (data) => {
      console.log("received:", data.data);

      const obj = { message: data.data, type: "server" };
      console.log("obj", obj);
      setMessages((prev) => [...prev, obj]);
      handleTTS(data.data);
    };
  }, [handleTTS]);

  // useEffect(() => {
  //   if (status === "stopped" && mediaBlobUrl) {
  //     setVidRecordings((prev) => [...prev, mediaBlobUrl]);
  //   }
  // }, [status, mediaBlobUrl]);

  return (
    <div className="h-[100vh] flex">
      <div className="w-[30%] border-2">
        {vidRecordings.map((vdo, index) => {
          return (
            <div
              className={`flex flex-col p-1 ${index === 0 ? "border-b-1" : ""}`}
              key={`vdo-${index}`}
            >
              <div className="flex justify-between border-b-2 pb-2">
                <span>{`${index + 1}. Video`}</span>
                <span
                  className="text-blue-800 cursor-pointer"
                  onClick={() =>
                    utils.downloadFile("my-screen-vdo", vdo.vdoBlob)
                  }
                >
                  Download
                </span>
              </div>
              <video src={vdo.vdoSrc} controls />
            </div>
          );
        })}
      </div>
      <div className="h-[80%] w-[70%] border-2 mx-auto">
        <div className="border-b-2 h-[90%] mt-3 overflow-auto">
          {messages.map((item, index) => {
            return (
              <div className="flex mt-1" key={`con-${index}`}>
                <div
                  className={`${
                    item.type === "client" ? "ms-auto" : "me-auto"
                  } bg-slate-500 text-cyan-100 p-3 rounded-md mx-2 relative w-[40%]`}
                >
                  <span>{item.message}</span>
                  <span
                    className="absolute bg-slate-500 top-0 right-0 h-[20px] p-1 w-[20px] cursor-pointer"
                    onClick={() => handleTTS(item.message)}
                  >
                    <Speaker />
                  </span>
                </div>
              </div>
            );
          })}
          {isListening && (
            <div className="flex mt-1">
              <span
                className={`ms-auto bg-slate-500 text-cyan-100 p-3 rounded-md mx-2`}
              >
                {userInput}
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-center gap-5">
          {isListening ? (
            <button
              type="button"
              onClick={handleStop}
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
              stop
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSpeaking}
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
              speak
            </button>
          )}
          {status !== "recording" ? (
            <button
              type="button"
              onClick={handleStartScreenRecording}
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
              Record
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopScreenRecording}
              className="bg-red-500 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
              stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;
