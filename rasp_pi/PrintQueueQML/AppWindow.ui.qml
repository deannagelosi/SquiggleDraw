import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Window 2.2 

ApplicationWindow {
    width: 800
    height: 480
    visible: true
    visibility: Window.FullScreen
    title: "SquiggleQueue"

    Text {
        id: title
        width: 232
        height: 54
        color: "#000000"
        text: qsTr("SquiggleDraw")
        font.pixelSize: 32
        horizontalAlignment: Text.AlignHCenter
        verticalAlignment: Text.AlignVCenter
        wrapMode: Text.Wrap
        font.weight: Font.Normal
        anchors.verticalCenterOffset: -191
        font.family: "IBM Plex Sans"
        anchors.horizontalCenterOffset: 1
        anchors.centerIn: parent
    }

    Rectangle {
        id: controls_box
        x: 631
        y: 94
        width: 134
        height: 352
        color: "#f0f0f0"
        radius: 6
        border.color: "#40000000"
        border.width: 1
    }

    Play {
        id: play_button
        objectName: "play_button"
        x: 648
        y: 140
        width: 100
        height: 100
    }

    Stop {
        id: stop_button
        objectName: "stop_button"
        x: 648
        y: 306
        width: 100
        height: 100
    }

    Rectangle {
        id: table_placeholder
        x: 30
        y: 94
        width: 573
        height: 352
        color: "#f0f0f0"
        radius: 6
        border.color: "#40000000"
        border.width: 1
    }


}

/*##^##
Designer {
    D{i:0;uuid:"0fd394c3-a284-58b9-aca1-30faf0e7fc1b"}D{i:1;uuid:"18210b84-7fe3-5a35-8b4f-adc5ff295785"}
D{i:2;uuid:"eb13b562-0d10-5457-ba05-f0384de30a0c"}D{i:3;uuid:"ba79c8c6-d40f-5f54-8228-39b86d6677f4_instance"}
D{i:4;uuid:"4c6f14a1-152d-5dd7-a9bc-4e515bc123e4"}D{i:5;uuid:"a68b2aaa-50f0-5eb6-a71c-7e294f1cd485_instance"}
}
##^##*/

