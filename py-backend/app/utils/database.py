import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_db():
    conn = psycopg2.connect(
        host=os.getenv("PGHOST"),
        database=os.getenv("PGNAME"),
        user=os.getenv("PGUSER"),
        password=os.getenv("PGPASS"),
        port=os.getenv("PGPORT")
    )
    return conn
