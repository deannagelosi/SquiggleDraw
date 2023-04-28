import QtQuick
import QtQuick.Shapes 1.15

Rectangle {
    id: stop
    width: 100
    height: 100
    color: "transparent"
    state: "state_unavailable"

    Shape {
        id: stop_shape
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.bottom: parent.bottom

        ShapePath {
            id: stop_svg
            strokeColor: "#000000"
            strokeWidth: 2
            PathSvg { 
                path: "M 50.000003122194705 0 C 63.806068684786716 0 76.30749396667095 5.596614332454047 85.3556204750032 14.645075265503005 C 94.4027236840199 23.692922692348713 100 36.19302728500932 100 50.000412126304475 C 100 63.80779696759963 94.40333719528005 76.307695497108 85.3556204750032 85.35574742602145 C 76.3068804554108 94.40277606405391 63.80545517352658 100 50.000003122194705 100 C 36.19455107086283 100 23.692506033329053 94.40338957025716 14.64437952499679 85.35574742602145 C 5.597276315980093 76.30708199090475 0 63.80575038583764 0 50.000412126304475 C 0 36.19507386677131 5.59666202417128 23.693127194416462 14.6451975400103 14.645075265503005 C 23.693119544589184 5.598046627470541 36.193322487245204 0.0008187888132435914 50.00082113720821 0.0008187888132435914 L 50.000003122194705 0 Z M 28.476429553046586 31.842102173853856 L 46.63284101734591 50 L 28.476429553046586 68.15789782614614 C 27.54685832748026 69.0874613896974 27.54685832748026 70.5948562781323 28.476429553046586 71.52523824022568 C 29.406000778612913 72.45480180377693 30.913408091891935 72.45480180377693 31.84379772274611 71.52523824022568 L 50.000209187045435 53.367340414079536 L 68.1582598035665 71.52523824022568 C 69.08783102913283 72.45480180377693 70.59523209802242 72.45480180377693 71.5256217288766 71.52523824022568 C 72.45519295444294 70.59567467667442 72.45519295444294 69.08827978823952 71.5256217288766 68.15789782614614 L 53.367574234550254 50 L 71.5256217288766 31.842102173853856 C 72.45519295444294 30.912538610302608 72.45519295444294 29.405143721867695 71.5256217288766 28.474761759774324 C 70.59605050331027 27.545198196223076 69.08864943442067 27.545198196223076 68.1582598035665 28.474761759774324 L 50.000209187045435 46.632659585920464 L 31.842161692719092 28.476397776316325 C 30.912590467152764 27.546834212765077 29.40518315387374 27.546834212765077 28.474793523019564 28.476397776316325 C 27.546020310906897 29.40516333299156 27.54605767967481 30.912538610302608 28.476429553046586 31.842102173853856 Z"
            }
        }
    }

    states: [
        State {
            name: "state_ready"
            PropertyChanges {
                target: stop_svg
                fillColor: "#ccf24726"
            }        
        },
        State {
            name: "state_unavailable"
            PropertyChanges {
                target: stop_svg
                fillColor: "#66000000"
            }
        }
    ]
}



/*##^##
Designer {
    D{i:0;uuid:"195a61d8-9a98-5c17-a878-8dee1722c60d"}D{i:1;uuid:"8fd0d14a-d433-55fa-ab95-6fb699a2bbef"}
}
##^##*/

