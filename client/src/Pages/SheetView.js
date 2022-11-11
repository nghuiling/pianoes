import React, { useEffect, useRef, useState } from 'react';
import { IconButton, Stack } from '@mui/material';
import { Notation, Midi } from 'react-abc';
import { useParams } from 'react-router-dom';
import { get, postFile } from '../Adapters/base';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import StopIcon from '@mui/icons-material/Stop';

export default function MusicSelect() {
  const [notation, setNotation] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [webMediaRecorder, setWebMediaRecorder] = useState(null);
  const audioClips = useRef();
  const { id } = useParams();

  useEffect(() => {
    get('/api/music/select', { music_id: id })
      .then((data) => {
        setNotation(data);
      })
      .catch((err) => {
        console.log(`error loading selected sheet music: ${err}`);
      });
  }, [id, notation]);

  const initializeMedia = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true, // only audio needed for this app
        })
        .then((stream) => {
          // Success callback
          // const options = { mimeType: 'video/webm; codecs=vp9' };
          const chunks = [];
          const mediaRecorder = new MediaRecorder(stream);
          setWebMediaRecorder(mediaRecorder);
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };
          mediaRecorder.onstop = (e) => {
            const blob = new Blob(chunks, { type: 'audio/webm; codecs=vp9' });
            chunks.splice(0);
            postFile('/api/record_audio', blob, id).then((res) => {
              // TODO: handle the response and display results
              console.log(res);
            });

            // TODO: REMOVE everything below once ready for production, this is only for sanity check (listen to audio)
            const clipName = `clip-${audioClips.current.children.length}`;

            const clipContainer = document.createElement('article');
            const clipLabel = document.createElement('p');
            const audio = document.createElement('audio');
            const deleteButton = document.createElement('button');

            clipContainer.classList.add('clip');
            audio.setAttribute('controls', '');
            deleteButton.innerHTML = 'Delete';
            clipLabel.innerHTML = clipName;

            clipContainer.appendChild(audio);
            clipContainer.appendChild(clipLabel);
            clipContainer.appendChild(deleteButton);
            audioClips.current.appendChild(clipContainer);
            const audioURL = window.URL.createObjectURL(blob);
            audio.src = audioURL;

            deleteButton.onclick = (e) => {
              let evtTgt = e.target;
              evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
            };
            // END OF REMOVE
          };
        })
        .catch((err) => {
          console.error(`The following getUserMedia error occurred: ${err}`);
          alert('You need to enable microphone for this feature to work!');
        });
    } else {
      console.log('getUserMedia not supported on your browser!');
    }
  };

  useEffect(() => {
    initializeMedia();
    // eslint-disable-next-line
  }, []);

  const toggleRecord = (ev) => {
    if (webMediaRecorder) {
      isRecording ? webMediaRecorder.stop() : webMediaRecorder.start();
      setIsRecording(!isRecording);
    } else {
      initializeMedia();
    }
  };

  return (
    <Stack style={{ margin: 'auto' }} spacing={2}>
      <IconButton
        color='error'
        aria-label='record'
        onClick={toggleRecord}
        sx={{
          marginTop: '30px',
          mx: 'auto',
          width: '80px',
          height: '80px',
          backgroundColor: '#eeeeee',
          '&:hover': {
            backgroundColor: '#ffffff',
          },
        }}
      >
        {isRecording ? <StopIcon /> : <KeyboardVoiceIcon />}
      </IconButton>
      <Notation notation={notation} />
      {notation && <Midi notation={notation} />}
      <Stack spacing={0} ref={audioClips}></Stack>
    </Stack>
  );
}
