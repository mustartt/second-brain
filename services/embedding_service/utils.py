import itertools


def chunk(merged, chunk_size=350, overlap=0):
    return (
        merged[i:i + chunk_size]
        for i in range(0, len(merged), chunk_size - overlap)
    )


def batched(iterable, n):
    it = iter(iterable)
    while True:
        batch = list(itertools.islice(it, n))
        if not batch:
            return
        yield batch
