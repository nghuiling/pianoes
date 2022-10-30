# -*- coding: utf-8 -*-
"""audio_to_midi

Install the Bytedance piano transcription package:
pip install ffmpeg wget
pip install piano_transcription_inference
"""




# Arguments: raw audio path and save path
# piano playing audion transcription:import from source_audio_path and save in out_midi_path

from piano_transcription_inference import PianoTranscription, sample_rate, load_audio

def transcribe(source_audio_path, out_midi_path):
    # Load audio
    audio, _ = load_audio(source_audio_path, sr=sample_rate, mono=True)

    # Transcriptor
    transcriptor = PianoTranscription(device='cuda', checkpoint_path=None)

    # Transcribe and write out to MIDI file
    transcriptor.transcribe(audio, out_midi_path)