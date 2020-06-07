import os
import psycopg2
from os.path import join, dirname
from dotenv import load_dotenv

load_dotenv(verbose=True)

dotenv_path = join(dirname(__file__),'.env')
load_dotenv(dotenv_path)


def get_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)


def rollcall(pl_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT display_names FROM participant_list WHERE id = %s',(pl_id,))
            rows = cur.fetchall()
            return rows[0][0]