import sys, math
from PyQt5.QtWidgets import QApplication
from PyQt5.QtQml import QQmlApplicationEngine
from PyQt5.QtCore import QTimer, QObject, pyqtSlot, pyqtSignal
from db_controller import db_connect, read_queue_data, set_plotted
from print_controller import setup_printer, print_receipt
from axi_controller import setup_plotter, plot_svg, stop_plot
import threading
import json

def main(): 
    # Launch the UI
    app = QApplication(sys.argv)
    # Create an instance of the controller and add it to the QML context
    controller = Controller();

    # Execute application and wait for exit
    sys.exit(app.exec())

class Controller(QObject):
    def __init__(self):
        super().__init__()
        # Setup hardware
        self.thermal = setup_printer()
        self.axi = setup_plotter()

        # Create and initialize the QML engine
        self.engine = QQmlApplicationEngine()
        self.engine.load('PrintQueueQML/AppWindow.ui.qml')
        self.root_object = self.engine.rootObjects()[0]

        # Load class that provides db data to the UI table
        self.db_data = DataProvider()
        self.engine.rootContext().setContextProperty("dataProvider", self.db_data)

        # Setup the UI interactivity
        self.setup_screen()

        # Setup ui variables
        self.current_id = 1

        # Fetch DB data and update

        # Set up a QTimer to refresh the data every 5 seconds
        self.timer = QTimer()
        self.timer.timeout.connect(self.db_data.check_updates)
        self.timer.start(1500)  # Update every 5 seconds (5000 milliseconds)

    def setup_screen(self):
        # Two kinds of configuration: Listeners and Properties
        # Listeners let us know when a element is clicked or value updated (qt calls them slots)
        # Properties control the appearance of an element with .setProperty("property", "value")

        # Setup buttons
        stop_button = self.get_object("stop_button")
        stop_button.setProperty("state", "state_ready")

        play_button = self.get_object("play_button")
        play_button.setProperty("state", "state_ready")
        # listens for clicks
        play_button.clicked.connect(self.press_play)
        stop_button.clicked.connect(self.press_stop)

        # Setup the table
        queue_table = self.get_object("queue_table")
        queue_table.rowChanged.connect(self.which_row)

    def get_object(self, object_name):
        # Search for specific components by objectName
        obj = self.root_object.findChild(QObject, object_name)

        if obj is None: 
            raise ValueError(f"Can't find object: {object_name}")
        
        return obj
    
    def press_play(self):
        # find button
        stop_button = self.get_object("stop_button")
        play_button = self.get_object("play_button")

        # press button
        if play_button.property("state") == "state_ready":
            #  disable play
            play_button.setProperty("state", "state_unavailable")

            # Retrieve data for selected record
            selected_row = self.find_by_id(self.db_data.table_data, self.current_id)

            # the axidraw and thermal printer block the UI. run in a thread instead                
            hw_thread = threading.Thread(target=self.print_and_plot, args=(selected_row,))
            # Start the thread
            hw_thread.start()

    def press_stop(self):
        # re-enable play button
        play_button = self.get_object("play_button")
        play_button.setProperty("state", "state_ready")
        # Stop axi plotting
        stop_plot(self.axi)

    def which_row(self, selected_id):
        # test selecting the current row
        print(f"Current ID: {selected_id}")
        self.current_id = selected_id
    
    def find_by_id(self, data, search_id):
        for row in data:
            if row['id'] == search_id:
                return row
        return None
    
    def print_and_plot(self, row):
        plot_svg(self.axi, row["svg_data"])
        print_receipt(self.thermal, row)

        cursor, db = db_connect()
        set_plotted(cursor, row["id"])
        # Commit the transaction
        db.commit()
        cursor.close()
        db.close()

class DataProvider(QObject):
    # Custom class to allow QML access to the db function

    # signal for when new squiggles
    dataChanged = pyqtSignal()

    def __init__(self):
        super().__init__()

        # setup initial data from db
        self.table_data = self.get_data()

    @pyqtSlot(result="QVariantList")
    def get_data(self):
        cursor, db = db_connect()
        rows = read_queue_data(cursor)
        # Get the column names from the cursor description
        column_names = [desc[0] for desc in cursor.description]
        # close the db
        cursor.close()
        db.close()

        # Convert the list of tuples into a list of dictionaries
        result = [dict(zip(column_names, row)) for row in rows]
        for row in result:
            params_string = row["squiggle_params"]
            params_dict = json.loads(params_string)
            row["title"] = params_dict["title"]

            row["datetime"] = row["datetime"].strftime("%-m/%-d/%y %-I:%M:%S %p")

            if row["axi_printed"] == None:
                row["axi_printed"] = "False"
            else:
                row["axi_printed"] = str(row["axi_printed"])

        return result
    
    def check_updates(self):
        results = self.get_data()

        if results != self.table_data:
            # global table_data
            self.table_data = results
            print("new squiggle!")
            self.dataChanged.emit()

if __name__ == '__main__':
    main()