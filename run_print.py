# source: https://github.com/adafruit/Python-Thermal-Printer/blob/master/printertest.py

from lib.Adafruit_Thermal import *
import img.squiggle_seed234_384x259 as test_squiggle

printer = Adafruit_Thermal("/dev/serial0", 9600, timeout=5)

printer.feed(1)
# Print the test squiggle
printer.printBitmap(test_squiggle.width, test_squiggle.height, test_squiggle.data)
printer.feed(2)

# printer.sleep()      # Tell printer to sleep
