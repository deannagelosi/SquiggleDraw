# On the Raspberry Pi with built-in UART:
import serial
import adafruit_thermal_printer

uart = serial.Serial("/dev/serial0", baudrate=9600, timeout=3000)
ThermalPrinter = adafruit_thermal_printer.get_printer_class(1.06)

printer = ThermalPrinter(uart)
# printer.test_page()

printer.print('Hello from CircuitPython!')
printer.feed(2)