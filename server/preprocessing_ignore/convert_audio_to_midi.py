# -*- coding: utf-8 -*-
"""audio_to_midi

Install the Bytedance piano transcription package:
pip install ffmpeg wget
pip install piano_transcription_inference
"""




# Arguments: raw audio path and save path
from piano_transcription_inference import PianoTranscription, sample_rate, load_audio

# piano playing audion transcription:import from source_audio_path and save in out_midi_path
def transcribe(source_audio_path, out_midi_path):
    # Load audio
    audio, _ = load_audio(source_audio_path, sr=sample_rate, mono=True)

    # Transcriptor:load pre-trained model from path checkpoint
    #script_dir = os.path.dirname(sys.argv[0])
    #checkpoint = os.path.abspath(os.path.join(script_dir, 'piano_transcription_inference_data', 'CRNN_note_F1=0.9677_pedal_F1=0.9186.pth'))
    
    transcriptor = PianoTranscription(device='cuda', checkpoint_path=checkpoint)

    # Transcribe and write out to MIDI file
    transcriptor.transcribe(audio, out_midi_path)
