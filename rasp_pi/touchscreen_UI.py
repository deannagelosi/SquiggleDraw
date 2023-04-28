import sys, math
from PyQt6.QtWidgets import QApplication
from PyQt6.QtQml import QQmlApplicationEngine
from PyQt6.QtCore import QTimer, QObject, pyqtSlot, pyqtSignal

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
        # Create and initialize the QML engine
        self.engine = QQmlApplicationEngine()
        self.engine.load('PrintQueueQML/AppWindow.qml')
        self.root_object = self.engine.rootObjects()[0]
        self.setup_screen()

        # Setup global program variables


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
            play_button.setProperty("state", "state_unavailable")
            stop_button.setProperty("state", "state_ready")

    def press_stop(self):
        # find button
        stop_button = self.get_object("stop_button")
        play_button = self.get_object("play_button")

        # press button
        if stop_button.property("state") == "state_ready":
            stop_button.setProperty("state", "state_unavailable")
            play_button.setProperty("state", "state_ready")
    
if __name__ == '__main__':
    main()