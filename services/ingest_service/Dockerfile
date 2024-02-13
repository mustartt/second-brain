FROM python:3.11-slim

WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt

ENV NLTK_DATA /app/nltk_data

RUN python3 -m nltk.downloader stopwords -d $NLTK_DATA && \
    python3 -m nltk.downloader punkt -d $NLTK_DATA

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]
