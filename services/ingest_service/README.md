# ingest-service

## Image Description

Exposed on port 8000

```text
OPENAI_API_KEY=
PINECONE_API_KEY=
UNSTRUCTURED_API_KEY=
UNSTRUCTURED_API_URL=
```

## Scripts

```shell
docker build -t us-central1-docker.pkg.dev/speedy-atom-413006/docker/ingest-service:0.0.0 .
```

```shell
docker run --rm -p 8000:8000 --env-file .env -v $env:APPDATA/gcloud:/gcp -e GOOGLE_APPLICATION_CREDENTIALS=/gcp/application_default_credentials.json -e GOOGLE_CLOUD_PROJECT=speedy-atom-413006 us-central1-docker.pkg.dev/speedy-atom-413006/docker/ingest-service:0.0.0
```

```shell
docker push us-central1-docker.pkg.dev/speedy-atom-413006/docker/ingest-service:0.0.0
```
