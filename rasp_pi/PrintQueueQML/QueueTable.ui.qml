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

        rowDelegate: Rectangle {
            color: (styleData.selected ? "#f0f0f0" : "white")
            height: 40
        }

        itemDelegate: Text {
            text: styleData.value
            color: "black"
            anchors.verticalCenter: parent.verticalCenter
        }

        TableViewColumn {
            title: "Timestamp"
            role: "datetime"
            width: 200
        }

        TableViewColumn {
            title: "Name"
            role: "author"
            width: 100
        }

        // TableViewColumn {
        //     title: "Title"
        //     role: "title"
        //     width: titleDelegate.implicitWidth + 8
        //     delegate: titleDelegate
        // }

        TableViewColumn {
            title: "Printed"
            role: "axi_printed"
            width: 100
        }

        onCurrentRowChanged: {
            var selectedId = tableView.model[tableView.currentRow].id
            rowChanged(selectedId)
        }

        Connections {
            target: dataProvider

            onDataChanged: {
                tableView.model = dataProvider.get_data()
            }
        }
    }
}
