# source: https://github.com/adafruit/Python-Thermal-Printer/blob/master/printertest.py
from lib.Adafruit_Thermal import *
from datetime import datetime
# import img.squiggle_seed234_384x259 as test_squiggle
from db_controller import db_connect, read_receipt_data, set_printed
import time
from PIL import Image

def main():
    printer = setup_printer()
    test_print(printer)

def setup_printer():
    # setup printer
    printer = Adafruit_Thermal("/dev/serial0", 9600, timeout=5)

    return printer

# def print_image(printer):
#     printer.feed(1)
#     # Print the test squiggle
#     printer.printBitmap(test_squiggle.width, test_squiggle.height, test_squiggle.data)
#     printer.feed(2)

    # printer.sleep()      # Tell printer to sleep

def print_receipt(printer, data):
    # title, author, parameters: length, curl, compress, datetime

    # title
    printer.justify('C')
    printer.setSize('L')
    printer.println("SquiggleDraw")

    # title
    printer.justify('L')
    printer.setSize('S')
    printer.feed(1)
    printer.println(data["title"])

    # author
    printer.justify('L')
    printer.setSize('S')
    printer.println(data["author"])

    # length
    printer.justify('C')
    printer.setSize('L')
    printer.println(data["length"])

    # image for length
    printer.justify('C')
    printer.printImage(Image.open('img/length.png'), True)
    printer.feed(1)

    # turns
    printer.justify('C')
    printer.setSize('L')
    printer.println(data["turns"])

    # image for turns
    printer.justify('C')
    printer.printImage(Image.open('img/loop.png'), True)
    printer.feed(1)

    # compression
    printer.justify('C')
    printer.setSize('L')
    printer.println(data["compress"])

    # image for compression here
    printer.justify('C')
    printer.printImage(Image.open('img/compress.png'), True)
    printer.feed(2)

    # datetime
    printer.justify('L')
    printer.setSize('S')
    printer.println(data["datetime"])
    printer.feed(1)

    # github url
    printer.justify('L')
    printer.setSize('S')
    printer.println("https://github.com/deannagelosi/SquiggleDraw")

    # # logo here

    printer.feed(6)

    # update database to mark printed
    row_id = data["id"]
    # print(f"mark printed: {row_id}")

    cursor, db = db_connect()
    set_printed(cursor, row_id)
    # Commit the transaction
    db.commit()
    cursor.close()
    db.close()

if __name__ == "__main__":
    main()
