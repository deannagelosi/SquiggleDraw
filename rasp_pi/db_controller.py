import psycopg2
import json

def db_connect():
    # Connect to the database
    db = psycopg2.connect(
        dbname = "squiggle_db",
        user = "admin",
        password = "admin",
        host = "localhost",
        port = "5432"
    )

    # Create a cursor object to interact with the database
    cursor = db.cursor()

    return cursor, db

def set_printed(cursor, rows):
    # Prepare the UPDATE query template
    query = "UPDATE squiggles SET receipt_printed = TRUE WHERE id = %s;"

    # Loop through the rows and update the receipt_printed for each row
    for row in rows:
        id_key = row[0]
        cursor.execute(query, (id_key,))

def read_receipt_data(cursor):
    # Execute the SELECT query to fetch rows from the 'squiggles' table with a receipt_printed of FALSE
    cursor.execute("SELECT id, datetime, author FROM squiggles WHERE receipt_printed = FALSE;")

    # Fetch all the rows returned by the query
    rows = cursor.fetchall()
    
    return rows

def retrieve_squiggle(cursor, id):
    # Execute the SELECT query to fetch the row from the 'squiggles' table with the matching ID
    cursor.execute("SELECT id, datetime, author FROM squiggles WHERE id = %s;", (id,))

    # Fetch the row returned by the query
    row = cursor.fetchone()

    return row

def read_queue_data(cursor):
    # Execute the SELECT query to fetch rows from the 'squiggles' table with a receipt_printed of FALSE
    cursor.execute("SELECT * FROM squiggles;")

    # Fetch all the rows returned by the query
    rows = cursor.fetchall()
    
    return rows

def insert_data(cur, json_data):
    # Load JSON data
    # data = json.loads(json_data)

    # Prepare the INSERT query template
    query = "INSERT INTO squiggles (datetime, squiggle_params, svg_data, author) VALUES (%s, %s, %s, %s);"

    # Check if data is a list (multiple records) or a dict (single record)
    for record in json_data:
        cur.execute(query, (record['datetime'], record['squiggle_params'], record['svg_data'], record['author']))