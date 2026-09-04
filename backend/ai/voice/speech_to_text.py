class SpeechToText:

    def transcribe(self, audio_data):
        """
        Convert audio input into text.

        Currently acts as a simple interface.
        Actual speech recognition can be connected later.
        """

        if not audio_data:
            return ""

        if isinstance(audio_data, str):
            return audio_data.strip()

        return ""