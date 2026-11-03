import os
import subprocess
import sys
import time

try:
    import MySQLdb
except ImportError:
    import pymysql as MySQLdb


database_name = os.environ["DB_NAME"]
migration_lock = f"transcendence_django_migrations_{database_name}"[:64]
legacy_database_name = os.environ.get("LEGACY_DB_NAME", "transcendence_db")


def copy_legacy_project_data(connection):
    if database_name != "project_db":
        return

    with connection.cursor() as cursor:
        for table_name in ("projects_project", "projects_projectmember"):
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_schema = %s AND table_name = %s
                """,
                (legacy_database_name, table_name),
            )
            if cursor.fetchone()[0] == 0:
                continue

            cursor.execute(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = %s AND table_name = %s
                ORDER BY ordinal_position
                """,
                (database_name, table_name),
            )
            target_columns = [row[0] for row in cursor.fetchall()]

            cursor.execute(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = %s AND table_name = %s
                ORDER BY ordinal_position
                """,
                (legacy_database_name, table_name),
            )
            legacy_columns = {row[0] for row in cursor.fetchall()}
            columns = [
                column for column in target_columns
                if column in legacy_columns
            ]
            if not columns:
                continue

            quoted_columns = ", ".join(
                f"`{column.replace('`', '``')}`" for column in columns
            )
            cursor.execute(
                f"""
                INSERT IGNORE INTO `{database_name}`.`{table_name}`
                    ({quoted_columns})
                SELECT {quoted_columns}
                FROM `{legacy_database_name}`.`{table_name}`
                """
            )
    connection.commit()

for attempt in range(60):
    try:
        connection = MySQLdb.connect(
            host=os.environ["DB_HOST"],
            port=int(os.environ.get("DB_PORT", "3306")),
            user=os.environ["DB_USER"],
            passwd=os.environ["DB_PASSWORD"],
            db=os.environ["DB_NAME"],
        )
        break
    except MySQLdb.OperationalError:
        if attempt == 59:
            raise
        time.sleep(2)

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT GET_LOCK(%s, 300)", (migration_lock,))
        if cursor.fetchone()[0] != 1:
            raise RuntimeError("Could not acquire the Django migration lock")
    connection.commit()

    subprocess.run([sys.executable, "manage.py", "migrate", "--noinput"], check=True)
    copy_legacy_project_data(connection)
finally:
    with connection.cursor() as cursor:
        cursor.execute("SELECT RELEASE_LOCK(%s)", (migration_lock,))
    connection.close()

os.execvp(sys.argv[1], sys.argv[1:])