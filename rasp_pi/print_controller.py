# source: https://github.com/adafruit/Python-Thermal-Printer/blob/master/printertest.py

from lib.Adafruit_Thermal import *
from datetime import datetime
# import img.squiggle_seed234_384x259 as test_squiggle
from db_controller import db_connect, read_receipt_data, set_printed
import time

def setup_printer():
    # setup printer
    printer = Adafruit_Thermal("/dev/serial0", 9600, timeout=5)

    return printer

def print_receipt(printer, data):
    # print receipt
    printer.feed(3)
    printer.print(data["datetime"])
    printer.print(data["author"])
    printer.feed(5)

    # update database to mark printed
    row_id = data["id"]
    print(f"mark printed: {row_id}")

    cursor, db = db_connect()
    set_printed(cursor, row_id)
    # Commit the transaction
    db.commit()
    cursor.close()
    db.close()

# def print_image(printer):
#     printer.feed(1)
#     # Print the test squiggle
#     printer.printBitmap(test_squiggle.width, test_squiggle.height, test_squiggle.data)
#     printer.feed(2)

    # printer.sleep()      # Tell printer to sleep

if __name__ == "__main__":
    main()
