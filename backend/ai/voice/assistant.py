class VoiceAssistant:

    def process(self, text):
        if not text:
            return {
                "response": "I did not receive any input."
            }

        return {
            "response": f"Received command: {text}"
        }