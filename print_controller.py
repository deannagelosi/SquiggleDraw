# source: https://github.com/adafruit/Python-Thermal-Printer/blob/master/printertest.py

from lib.Adafruit_Thermal import *
import img.squiggle_seed234_384x259 as test_squiggle
import psycopg2
import json

def print_image():
    printer = Adafruit_Thermal("/dev/serial0", 9600, timeout=5)

    printer.feed(1)
    # Print the test squiggle
    printer.printBitmap(test_squiggle.width, test_squiggle.height, test_squiggle.data)
    printer.feed(2)

    # printer.sleep()      # Tell printer to sleep

def main():
    # Replace these with your actual database credentials
    db_name = "squiggle_db"
    db_user = "admin"
    db_password = "admin"
    db_host = "localhost"
    db_port = "5432"

    # Connect to the database
    conn = psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=db_password,
        host=db_host,
        port=db_port
    )

    # Create a cursor object to interact with the database
    cur = conn.cursor()

    print("pre data: ")
    read_data(cur)
    
    json_test = {
        "datetime": "997744",
        "author": "Pangur"
    }

    insert_data(cur, json_test)

    print("post data: ")
    read_data(cur)

    # Close the cursor and the connection
    cur.close()
    conn.close()

def insert_data(cur, json_data):
    # Prepare the INSERT query template
    query = "INSERT INTO squiggles (datetime, author) VALUES (%s, %s);"

    # Check if data is a list (multiple records) or a dict (single record)
    for record in data:
        cur.execute(query, (record['datetime'], record['author']))

def read_data(cur):
    # Execute the SELECT query to fetch all rows from the 'squiggles' table
    cur.execute("SELECT * FROM squiggles;")

    # Fetch all the rows returned by the query
    rows = cur.fetchall()

    # Print the rows
    for row in rows:
        print(row)


if __name__ == "__main__":
    main()
