import sys, math
from PyQt5.QtWidgets import QApplication
from PyQt5.QtQml import QQmlApplicationEngine
from PyQt5.QtCore import QTimer, QObject, pyqtSlot, pyqtSignal
from db_controller import db_connect, read_queue_data
import time

table_data = []

def main(): 
    # Launch the UI
    app = QApplication(sys.argv)
    # Create an instance of the controller and add it to the QML context
    controller = Controller();

    # Execute application and wait for exit
    sys.exit(app.exec())

    # # while True:
    # cursor, db = db_connect()
    # rows = read_queue_data(cursor)

    # if rows:

    #     # printer.feed(2)
    #     for row in rows:
    #         print(row)
    #     #     # Format the datetime object as a string
    #     #     datetime = row[1].strftime("%Y-%m-%d %H:%M:%S")
    #     #     author = row[2]

    #     #     # print(type(row[0]))
    #     #     printer.print(datetime + ' ' + author)

    #     #     printer.feed(2)

    #     # printer.feed(4)
    #     # set_printed(cursor, rows)

    #     # Commit the transaction
    #     # db.commit()

    # cursor.close()
    # db.close()

    # Wait for 2 seconds before looping again
    # time.sleep(2)

class Controller(QObject):
    def __init__(self):
        super().__init__()
        # Create and initialize the QML engine
        self.engine = QQmlApplicationEngine()
        self.engine.load('PrintQueueQML/AppWindow.ui.qml')
        self.root_object = self.engine.rootObjects()[0]

        # Load class that provides db data to the UI table
        data_provider = DataProvider()
        self.engine.rootContext().setContextProperty("dataProvider", data_provider)

        # Setup the UI interactivity
        self.setup_screen()

        # Setup ui variables
        self.current_id

        # Fetch DB data and update

        # Create a QTimer to update every x seconds
        # self.timer = QTimer()
        # self.timer.timeout.connect(self.updateValues)
        # self.timer.start(seconds_update * 1000)

    def setup_screen(self):
        # Two kinds of configuration: Listeners and Properties
        # Listeners let us know when a element is clicked or value updated (qt calls them slots)
        # Properties control the appearance of an element with .setProperty("property", "value")

        # Setup buttons
        stop_button = self.get_object("stop_button")
        stop_button.setProperty("state", "state_unavailable")

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
            # update visuals
            play_button.setProperty("state", "state_unavailable")
            stop_button.setProperty("state", "state_ready")

            # Retrieve data for selected record
            selected_row = self.find_by_id(table_data, self.current_id)

            print(selected_row)
            
            # Call to print thermal receipt
            # print(f"Print the squiggle on row {self.current_row}")

    def press_stop(self):
        # find button
        stop_button = self.get_object("stop_button")
        play_button = self.get_object("play_button")

        # press button
        if stop_button.property("state") == "state_ready":
            stop_button.setProperty("state", "state_unavailable")
            play_button.setProperty("state", "state_ready")

    def which_row(self, selected_id):
        # test selecting the current row
        print(f"Current ID: {selected_id}")
        self.current_id = selected_id
    
    def find_by_id(data, searchId):
        for row in data:
            if row['id'] == searchId:
                return row
        return None

class DataProvider(QObject):
    # Create a custom class to allow the QML to access the db functions

    @pyqtSlot(result="QVariantList")
    def getData(self):
        return get_data()

def get_data():
    cursor, db = db_connect()
    rows = read_queue_data(cursor)

    # Get the column names from the cursor description
    column_names = [desc[0] for desc in cursor.description]

    # Convert the list of tuples into a list of dictionaries
    result = [dict(zip(column_names, row)) for row in rows]

    for row in result:
        row["datetime"] = row["datetime"].strftime("%-m/%-d/%y %-I:%M:%S %p")

    # print("result: ")
    # print(result)
    table_data = result
    return result

    # Test data. Convert data from the db into a list of dictionaries
    # data = [
    #     {"column1": "Value1", "column2": "Value2"},
    #     {"column1": "Value3", "column2": "Value4"},
    # ]
    # return data

if __name__ == '__main__':
    main()