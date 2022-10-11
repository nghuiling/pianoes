import librosa
import librosa.display
import matplotlib
import matplotlib.pyplot as plt
import mido
import numpy as np
import pandas as pd
import scipy


class Audio:
    """
    Audio class reads audio files (e.g. .wav, .mp3, .m4a) using Librosa library.
    """
    def __init__(self, filepath=None, x=None, sampling_rate=None):
        self.n_fft = 4410
        self.hop_size = 2205

        if filepath is not None:
            self.x, self.sampling_rate = librosa.load(filepath)
        else:
            self.x, self.sampling_rate = x, sampling_rate

        self.chroma = librosa.feature.chroma_stft(y=self.x,
                                                  sr=self.sampling_rate,
                                                  tuning=0,
                                                  norm=2,
                                                  hop_length=self.hop_size,
                                                  n_fft=self.n_fft)


class MidiAudio:
    """
    MidiAudio class reads MIDI files (.mid) using Mido library.
    """
    def __init__(self, filepath=None, notes=None, ticks_per_beat=-1, tempo=-1):
        self.filepath = filepath
        self.file = None
        self.notes = notes
        self.ticks_per_beat = ticks_per_beat
        self.tempo = tempo

        if filepath is not None:
            self.file = self.read(filepath)
            self.parse(self.file)

    @staticmethod
    def read(filename: str) -> mido.MidiFile:
        file = mido.MidiFile(filename, clip=True)
        return file

    def parse(self, file: mido.MidiFile) -> None:
        """
        Wrapper function to call parse_stats() and parse_notes()
        :param file: mido.MidiFile
        :return: None
        """
        self.ticks_per_beat, self.tempo = self.parse_stats(file)
        self.notes = self.parse_notes(file)

    @staticmethod
    def parse_stats(file: mido.MidiFile) -> tuple[int, int]:
        """
        Parses ticks_per_beat and tempo from Midi file
        :param file: mido.MidiFile
        :return: ticks_per_beat, tempo
        """
        # Parse ticks_per_beat
        ticks_per_beat = file.ticks_per_beat

        # Parse tempo
        tempo = None
        for track in file.tracks:
            for message in track:
                if message.is_meta:
                    if message.type == 'set_tempo':
                        tempo = message.tempo
        return ticks_per_beat, tempo

    def parse_notes(self, file: mido.MidiFile) -> dict[list[tuple[float, int]]]:
        """
        Parses messages from Midi file into notes dictionary
        Notes dictionary maps each Midi note to list of occurrences, where occurrence = (time_in_seconds, velocity)
        :param file: mido.MidiFile
        :return:
        """
        notes = {i: [] for i in range(128)}

        for track in file.tracks:  # file = mido.MidiFile object
            current_ticks = 0
            for message in track:  # might have multiple tracks
                if not message.is_meta:  # Ignore meta messages, which set rhythm and stuff
                    if message.type == 'note_on':  # Ignore control change as it deals with expressiveness
                        # Time = time since last message, in MIDI ticks
                        note, velocity, delta_ticks = message.note, message.velocity, message.time
                        current_ticks += delta_ticks
                        current_time = mido.tick2second(current_ticks, self.ticks_per_beat, self.tempo)
                        notes[note].append((current_time, velocity))
        return notes

    def plot(self, note_number: int) -> None:
        """
        Plots velocity against time for a single note number
        :param note_number: Single midi note number
        :return: None
        """
        note = self.notes[note_number]
        time = [time for time, velocity in note]
        velocity = [velocity for time, velocity in note]
        plt.plot(time, velocity)
        plt.show()

    def export(self, filepath: str) -> None:
        """
        Exports notes into midi (.mid) file.
        :param filepath:
        :return:
        """
        # Compile all notes into sequence of messages
        messages = []
        for note, occurrences in self.notes.items():
            for occurrence in occurrences:
                time, velocity = occurrence
                time = mido.second2tick(time, self.ticks_per_beat, self.tempo)  # Change to ticks
                messages.append((note, time, velocity))
        messages.sort(key=lambda x: x[1])  # Sort by time

        # Change time to delta ticks instead of ticks
        new_messages = [(messages[0][0], 0, messages[0][2])]
        for i in range(1, len(messages)):
            _, ticks_previous, _ = messages[i - 1]
            note, ticks_current, velocity = messages[i]
            delta_ticks = int(ticks_current - ticks_previous)
            new_messages.append((note, delta_ticks, velocity))

        # Create MIDI file object
        mid = mido.MidiFile()
        track = mido.MidiTrack()
        mid.tracks.append(track)

        # Append meta messages
        track.append(mido.MetaMessage('set_tempo', tempo=self.tempo))

        # Append note messages
        for message in new_messages:
            note, time, velocity = message
            midi_message = mido.Message('note_on', note=note, velocity=velocity, time=time)
            track.append(midi_message)

        mid.save(filepath)


class Synchronise:
    """
    Synchronise class maps the query audio to match the reference audio using dynamic time warping.
    """
    def __init__(self, audio_query: Audio, audio_reference: Audio, midi_query: MidiAudio):
        self.audio_query = audio_query
        self.audio_reference = audio_reference
        self.midi_query = midi_query

        self.hop_size = audio_reference.hop_size
        self.sampling_rate = audio_reference.sampling_rate

        # Attributes used for DTW
        self.distance_matrix, self.warp_path, self.warp_path_scaled, self.df_mappings = self.compute_dtw()

        # Mapping Function generated by DTW
        self.mapping_function = self.compute_mapping_function()

    def compute_dtw(self):
        """
        Computes dynamic time warping, mapping query audio to reference audio
        :return: (distance_matrix, warp_path, warp_path_scaled, df_mappings), where
        distance_matrix: np.array
        warp_path: np.array
        warp_path_scaled: np.array = warp_path * hop_size / sampling_rate
        df_mappings: pd.Dataframe with 2 columns. audio_query column = time stamp in audio_query, audio_reference column
        = time stamp in audio_reference
        """
        distance_matrix, warp_path = librosa.sequence.dtw(X=self.audio_query.chroma,
                                                          Y=self.audio_reference.chroma,
                                                          metric='cosine')

        warp_path_scaled = np.asarray(warp_path) * self.hop_size / self.sampling_rate

        df_mappings = pd.DataFrame(warp_path_scaled, columns=["audio_query", "audio_reference"])
        df_mappings = df_mappings.sort_values(by="audio_reference")
        df_mappings = df_mappings.reset_index(drop=True)
        return distance_matrix, warp_path, warp_path_scaled, df_mappings

    def compute_mapping_function(self):
        x = self.df_mappings["audio_query"].to_numpy()
        y = self.df_mappings["audio_reference"].to_numpy()

        mapping_function = scipy.interpolate.interp1d(x, y, fill_value="extrapolate")
        return mapping_function

    def map_midi_audio(self) -> MidiAudio:
        """
        Maps midi_query to a new MidiAudio object representing warped query audio.
        :return:
        """
        midi_query = self.midi_query
        notes_query = midi_query.notes
        f = self.mapping_function
        new_notes_query = {}
        for note, occurrences in notes_query.items():
            # note = note number, occurrences = list of note occurrences. Occurrence = (time_in_s, velocity)
            new_notes_query[note] = [(float(f(time)), velocity) for time, velocity in occurrences if f(time) != np.inf]

        midi_ticks_per_beat, midi_tempo = midi_query.ticks_per_beat, midi_query.tempo
        return MidiAudio(notes=new_notes_query, ticks_per_beat=midi_ticks_per_beat, tempo=midi_tempo)

    def plot(self, label1=None, label2=None):
        # https://librosa.org/librosa_gallery/auto_examples/plot_music_sync.html
        audio1, audio2 = self.audio_query, self.audio_reference
        sampling_rate = self.sampling_rate
        wp = self.warp_path

        fig = plt.figure(figsize=(16, 8))
        # Plot x_1
        plt.subplot(2, 1, 1)
        librosa.display.waveshow(audio1.x, sr=sampling_rate)
        if label1 is not None:
            plt.title(f"{label1}")
        ax1 = plt.gca()

        # Plot x_2
        plt.subplot(2, 1, 2)
        librosa.display.waveshow(audio2.x, sr=sampling_rate)
        if label2 is not None:
            plt.title(f"{label2}")
        ax2 = plt.gca()

        plt.tight_layout()

        trans_figure = fig.transFigure.inverted()
        lines = []
        arrows = 30
        points_idx = np.int16(np.round(np.linspace(0, wp.shape[0] - 1, arrows)))

        for tp1, tp2 in self.warp_path_scaled:
            # get position on axis for a given index-pair
            coord1 = trans_figure.transform(ax1.transData.transform([tp1, 0]))
            coord2 = trans_figure.transform(ax2.transData.transform([tp2, 0]))

            # draw a line
            line = matplotlib.lines.Line2D((coord1[0], coord2[0]),
                                           (coord1[1], coord2[1]),
                                           transform=fig.transFigure,
                                           color='r')
            lines.append(line)

        fig.lines = lines
        plt.tight_layout()

        plt.show()
        return fig


if __name__ == '__main__':
    # Reference = fast
    FILENAME_AUDIO_SLOW = 'TestSlow.m4a'
    FILENAME_AUDIO_FAST = 'TestFast.m4a'
    FILENAME_MIDI_SLOW = 'TestSlow.mid'
    FILENAME_MIDI_EXPORT = 'TestExport.mid'

    audio_query = Audio(FILENAME_AUDIO_SLOW)
    audio_reference = Audio(FILENAME_AUDIO_FAST)
    midi_query = MidiAudio(FILENAME_MIDI_SLOW)

    synchronise = Synchronise(audio_query, audio_reference, midi_query)
    new_midi_query = synchronise.map_midi_audio()
    new_midi_query.export(FILENAME_MIDI_EXPORT)
