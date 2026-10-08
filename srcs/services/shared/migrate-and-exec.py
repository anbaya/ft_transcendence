import os
import subprocess
import sys

try:
    import MySQLdb
except ImportError:
    import pymysql as MySQLdb


connection = MySQLdb.connect(
    host=os.environ["DB_HOST"],
    port=int(os.environ.get("DB_PORT", "3306")),
    user=os.environ["DB_USER"],
    passwd=os.environ["DB_PASSWORD"],
    db=os.environ["DB_NAME"],
)

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT GET_LOCK('transcendence_django_migrations', 300)")
        if cursor.fetchone()[0] != 1:
            raise RuntimeError("Could not acquire the Django migration lock")
    connection.commit()

    subprocess.run([sys.executable, "manage.py", "migrate", "--noinput"], check=True)
finally:
    with connection.cursor() as cursor:
        cursor.execute("SELECT RELEASE_LOCK('transcendence_django_migrations')")
    connection.close()

os.execvp(sys.argv[1], sys.argv[1:])