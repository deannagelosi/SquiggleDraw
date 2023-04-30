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
    
    // Formatting for each column in the table
    Component {
        id: datetimeDelegate

        Text {
            text: styleData.value
            color: "black"
            padding: 4
            anchors.verticalCenter: parent.verticalCenter
        }
    }

    Component {
        id: authorDelegate

        Text {
            text: styleData.value
            color: "black"
            padding: 4
            anchors.verticalCenter: parent.verticalCenter
        }
    }

    Component {
        id: titleDelegate

        Text {
            text: styleData.value
            color: "black"
            padding: 4
            anchors.verticalCenter: parent.verticalCenter
        }
    }

    Component {
        id: statusDelegate

        Text {
            text: styleData.value
            color: "black"
            padding: 4
            anchors.verticalCenter: parent.verticalCenter
        }
    }


    TableView {
        id: tableView
        anchors.fill: parent

        rowDelegate: Rectangle {
            color: (styleData.selected ? "#f0f0f0" : "white")
            height: 40
        }

        itemDelegate: Text {
            text: styleData.value
            color: "black"
            anchors.verticalCenter: parent.verticalCenter
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
            title: "Timestamp"
            role: "datetime"
            width: datetimeDelegate.implicitWidth + 8
            delegate: datetimeDelegate
        }

        TableViewColumn {
            title: "Name"
            role: "author"
            width: authorDelegate.implicitWidth + 8
            delegate: authorDelegate
        }

        TableViewColumn {
            title: "Title"
            role: "title"
            width: titleDelegate.implicitWidth + 8
            delegate: titleDelegate
        }

        TableViewColumn {
            title: "Printed"
            role: "axi_printed"
            width: statusDelegate.implicitWidth + 8
            delegate: statusDelegate
        }

        onCurrentRowChanged: {
            var selectedId = tableView.model.get(tableView.currentRow).id
            rowChanged(selectedId)
        }
    }
}
