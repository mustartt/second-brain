from dotenv import load_dotenv

from embedding import PineconeDB


def main():
    pinecone = PineconeDB()
    pinecone.index.delete(delete_all=True, namespace='testing1')


if __name__ == '__main__':
    load_dotenv()
    main()
