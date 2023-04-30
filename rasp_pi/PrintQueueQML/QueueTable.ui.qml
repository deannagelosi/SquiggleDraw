import QtQuick 2.12
import QtQuick.Controls 1.4

Rectangle {
    color: "white"
    radius: 6
    border.color: "#40000000"
    border.width: 1

    property alias tableModel: tableView.model
    property alias selectedRow: tableView.currentRow
    signal rowChanged(int row)
    
    TableView {
        id: tableView
        anchors.fill: parent

        rowDelegate: Rectangle {
            color: (styleData.selected ? "#f0f0f0" : "white")
        }

        itemDelegate: Text {
            text: styleData.value
            color: "black"
        }

        headerDelegate: Rectangle {
            height: 30
            color: "#f0f0f0"
            border.color: "#40000000"
            border.width: 1
            Text {
                text: styleData.value
                color: "black"
                anchors.fill: parent
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
            }
        }

        // Rectangle {
        //     anchors.fill: parent
        //     color: "white"
        //     z: -1
        // }

        TableViewColumn {
            title: "ID"
            role: "id"
            width: 100
        }
        TableViewColumn {
            title: "Name"
            role: "datetime"
            width: 200
        }

        onCurrentRowChanged: {
            rowChanged(tableView.currentRow)
        }
    }
}
