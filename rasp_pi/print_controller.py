# source: https://github.com/adafruit/Python-Thermal-Printer/blob/master/printertest.py

from lib.Adafruit_Thermal import *
from datetime import datetime
# import img.squiggle_seed234_384x259 as test_squiggle
import psycopg2
import json
import time

def main():
    printer = Adafruit_Thermal("/dev/serial0", 9600, timeout=5)
    # print_image(printer)
    
    while True:
        cursor, db = db_connect()
        rows = read_data(cursor)

        if rows:
            printer.feed(2)
            for row in rows:
                # Format the datetime object as a string
                datetime = row[1].strftime("%Y-%m-%d %H:%M:%S")
                author = row[2]

                # print(type(row[0]))
                printer.print(datetime + ' ' + author)

                printer.feed(2)

            printer.feed(4)
            set_printed(cursor, rows)

            # Commit the transaction
            db.commit()

        cursor.close()
        db.close()

        # Wait for 2 seconds before looping again
        time.sleep(2)

def read_data(cursor):
    # Execute the SELECT query to fetch rows from the 'squiggles' table with a receipt_status of FALSE
    cursor.execute("SELECT id, datetime, author FROM squiggles WHERE receipt_status = FALSE;")

    # Fetch all the rows returned by the query
    rows = cursor.fetchall()
    
    return rows

def set_printed(cursor, rows):
    # Prepare the UPDATE query template
    query = "UPDATE squiggles SET receipt_status = TRUE WHERE id = %s;"

    # Loop through the rows and update the receipt_status for each row
    for row in rows:
        id_key = row[0]
        cursor.execute(query, (id_key,))

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

def print_image(printer):
    printer.feed(1)
    # Print the test squiggle
    printer.printBitmap(test_squiggle.width, test_squiggle.height, test_squiggle.data)
    printer.feed(2)

    # printer.sleep()      # Tell printer to sleep

if __name__ == "__main__":
    main()
