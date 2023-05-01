import QtQuick 2.0
import QtQuick.Shapes 1.15

Rectangle {
    id: exit
    color: "transparent"

    Shape {
        id: exit_shape
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.bottom: parent.bottom

        ShapePath {
            id: exit_svg
            // strokeColor: "#000000"
            // strokeWidth: 2
            fillColor: "#66000000"
            PathSvg {
                path: "M12.4,7.8L19.2,1c3.1-3.1,7.8,1.7,4.7,4.7l-6.7,6.7l6.7,6.8c3.1,3.1-1.6,7.8-4.7,4.7l-6.8-6.7L5.7,24 c-3.1,3.1-7.8-1.6-4.7-4.7l6.8-6.8L1,5.7C-2.1,2.6,2.7-2,5.7,1L12.4,7.8z"
            }
        }
    }

    // setting up event emitter (signal)
    signal clicked()
    
    // trigger event
    MouseArea {
        anchors.fill: parent
        onClicked: {
            exit.clicked()
        }
    }
}



/*##^##
Designer {
    D{i:0;uuid:"195a61d8-9a98-5c17-a878-8dee1722c60d"}D{i:1;uuid:"8fd0d14a-d433-55fa-ab95-6fb699a2bbef"}
}
##^##*/

