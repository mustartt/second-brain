FROM downloads.unstructured.io/unstructured-io/unstructured:latest

WORKDIR /app
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 8080
CMD ["/home/notebook-user/.local/bin/gunicorn", "app:app", "-w", "2", "--threads", "4", "-b", "0.0.0.0:8080", "--timeout", "300", "--log-level", "info"]
