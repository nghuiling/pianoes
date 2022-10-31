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
        self.hop_size = 512

        if filepath is not None:
            self.x, self.sampling_rate = librosa.load(filepath)
            self.x, self.x_trimmed_index = librosa.effects.trim(self.x, top_db=20, hop_length=32)
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

    def get_notes_onsets(self):
        """
        Creates new notes dictionary, mapping note number to occurrences.
        Removes all occurrences where velocity = 0 (i.e. offset)
        :return: notes_dictionary containing only onsets
        """
        notes_onsets = {note: [occurrence for occurrence in occurrences if occurrence[1] != 0]
                        for note, occurrences in self.notes.items()}
        return notes_onsets

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
        Parses messages from Midi file into notes dictionary, which maps each Midi note to list of occurrences,
        where occurrence = (time_in_seconds, velocity)
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
        new_messages = [(messages[0][0], 0, messages[0][2])]  # Note, time, velocity
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
    Synchronise maps the query audio to match the reference audio using dynamic time warping.
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
        distance_matrix: np.ndarray
        warp_path: np.ndarray
        warp_path_scaled: np.ndarray = warp_path * hop_size / sampling_rate
        df_mappings: pd.Dataframe with 2 columns. audio_query column = time stamp in audio_query, audio_reference column
        = time stamp in audio_reference
        """
        distance_matrix, warp_path = librosa.sequence.dtw(X=self.audio_query.chroma,
                                                          Y=self.audio_reference.chroma,
                                                          metric='euclidean')

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


class Evaluate:
    def __init__(self, midi_reference: MidiAudio, midi_query: MidiAudio, threshold_ms=500, window_size=3):
        """

        :param midi_reference:
        :param midi_query:
        :param threshold_ms: Threshold to be determined as correct note (in milliseconds)
        :param window_size: Number of query notes to check for every reference note
        """
        self.midi_reference = midi_reference
        self.midi_query = midi_query

        self.threshold = threshold_ms / 1000
        self.window_size = window_size

    def compare_note_hits(self, occurrences_reference, occurrences_query):
        """
        Compares list of 1 note
        :param occurrences_reference: list containing occurrences of one note
        :param occurrences_query:
        :return: (notes_hit, notes_misse, total_notes)
        """
        # If notes are empty for either, return 0
        if len(occurrences_reference) == 0 or len(occurrences_query) == 0:
            return 0, 0, 0

        threshold = self.threshold
        window_size = self.window_size

        # print("OCCURRENCES", occurrences_reference, occurrences_query)
        i, j = 0, 0
        notes_hit, notes_miss = 0, 0
        while i < len(occurrences_reference) and j < len(occurrences_query):

            # Get current note reference
            note_reference = occurrences_reference[i]
            note_reference_time = note_reference[0]

            # Get window of query notes to check over
            notes_query = occurrences_query[j: j + window_size]

            # Iterate over window of query notes to check for hit
            note_hit = False
            for k, note_query in enumerate(notes_query):
                note_query_time = note_query[0]

                #  Within threshold
                if -threshold <= note_reference_time - note_query_time <= threshold:
                    note_hit = True
                    i += 1
                    j = j + k + 1  # Move j to query note after the one that matches
                    break

            if note_hit is True:
                notes_hit += 1
            else:
                notes_miss += 1
                i += 1

        # Account for all reference notes that weren't checked when query notes ran out
        notes_miss += len(occurrences_reference[i:])

        return notes_hit, notes_miss, len(occurrences_reference)

    def run(self):
        """
        Calls compare_note_hits() for each of the 128 midi notes
        :return: notes_hit_total, notes_miss_total, notes_total
        """
        midi_notes_reference = self.midi_reference.get_notes_onsets()
        midi_notes_query = self.midi_query.get_notes_onsets()

        notes_hit_total, notes_miss_total, notes_total = 0, 0, 0
        for note in midi_notes_reference:
            occurrences_reference = midi_notes_reference[note]
            occurrences_query = midi_notes_query[note]
            notes_hit, notes_miss, notes = self.compare_note_hits(occurrences_reference, occurrences_query)

            notes_hit_total += notes_hit
            notes_miss_total += notes_miss
            notes_total += notes

        return notes_hit_total, notes_miss_total, notes_total
        
        
if __name__ == '__main__':
    # Sample Usage
 
    # Dynamic Time Warping
    FILENAME_AUDIO_QUERY = 'TestSlow.m4a'
    FILENAME_AUDIO_REFERENCE = 'TestReference.wav'
    FILENAME_MIDI_QUERY = 'TestSlow.mid'
    FILENAME_MIDI_EXPORT = 'TestExportMissingNotes.mid'
    FILENAME_MIDI_REFERENCE = 'TestReference.mid'

    audio_query = Audio(FILENAME_AUDIO_QUERY)
    audio_reference = Audio(FILENAME_AUDIO_REFERENCE)
    midi_query = MidiAudio(FILENAME_MIDI_QUERY)

    synchronise = Synchronise(audio_query, audio_reference, midi_query)
    synchronise.plot()

    new_midi_query = synchronise.map_midi_audio()
    new_midi_query.export(FILENAME_MIDI_EXPORT)

    # Evaluation
    midi_reference = MidiAudio(FILENAME_MIDI_REFERENCE)
    evaluator = Evaluate(midi_reference=midi_reference, midi_query=new_midi_query)
    notes_hit, notes_miss, notes_total = evaluator.run()
