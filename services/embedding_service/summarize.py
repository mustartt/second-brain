from abc import ABC, abstractmethod

import vertexai
from vertexai.language_models import TextGenerationModel


class TextGeneration(ABC):
    @abstractmethod
    def condense(self, content: str) -> str:
        ...

    @abstractmethod
    def summarize(self, content: str) -> str:
        ...


class TextGenGooglePaLM2(TextGeneration):
    def __init__(self):
        self.model = TextGenerationModel.from_pretrained("text-bison")

    def format_condense_prompt(self, content: str):
        return (
            f"""
        Input: Your goal is to summarize the text into a single concise sentence with as much context as possible.

        {content}
        """
        )

    def format_summary_prompt(self, content: str):
        return (
            f"""
            Input: Summarize the following text into a single short concise summary with as much context as possible.

            {content}
            """
        )

    def condense(self, content: str) -> str:
        parameters = {
            "candidate_count": 1,
            "max_output_tokens": 512,
            "temperature": 0,
            "top_p": 1
        }
        response = self.model.predict(
            prompt=self.format_condense_prompt(content),
            **parameters
        )
        return response.text

    def summarize(self, content: str) -> str:
        parameters = {
            "candidate_count": 1,
            "max_output_tokens": 1024,
            "temperature": 0,
            "top_p": 1
        }
        response = self.model.predict(
            prompt=self.format_summary_prompt(content),
            **parameters
        )
        return response.text
