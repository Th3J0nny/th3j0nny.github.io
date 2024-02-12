let ip = "ws://localhost:1254";
let connectKey = "";
let socket;
let activeProfile = "";


function send(type = "", profile = "", id = "", vol = "") {
    let req = {
        appName: "Jonnys Resanance Web App",
        key: connectKey,
        type: type,
        vol: vol,
        id: id,
        profile: profile
    }
    socket.send(JSON.stringify(req));
} 

function initConnection() {
    document.getElementById("start-button").style.display = "none";
    setStatus("Connecting...", "yellow");
    socket = new WebSocket(ip);
    socket.onopen = (e) => send();

    socket.onmessage = (e) => {
        let data = JSON.parse(e.data);
        console.log("Received: " + JSON.stringify(data));
        let response = data["response"];
        switch(response) {
            case "Listening":
                if (!connectKey) {
                    setStatus("Waiting for app to confirm authentication...", "yellow");
                } else {
                    setStatus("Connected", "green");
                    send("listProfiles");
                }
                break;
            case "profileList":
                if (data.list && data.list.length > 0) {
                    //for (profile of data.list) {
                        activeProfile = data.list[0];
                        send("getProfile", activeProfile);
                    //}
                } else {
                    setStatus("No profiles found.", "yellow");
                }
                break;
            case "buttonList":
                    if (data.list) {
                        for (sound of data.list) {
                            createButton(sound);
                        }
                    } else {
                        console.log("No sounds in profile.");
                    }
                break;
            case "Refresh":
                break;
            case "Accepted":
                setStatus("Connected", "green");
                connectKey = data["key"];
                send("listProfiles");
                break;
            default:
                console.log("Unknown response");
        }
    }

    socket.onclose = (e) => {
        console.log("Connection closed: " + str(e));
    }

    socket.onerror = (e) => {
        console.error(e);
    }
}

function setStatus(text, color = "#ffffff") {
    document.getElementById("status-text").innerText = text;
    document.getElementById("status-text").style.color = color;
}

function createButton(sound) {
    let gridElement = document.createElement("div");
    gridElement.className = "grid-item";
    gridElement.setAttribute("order", sound.index);
    gridElement.innerText = sound.shortname;
    gridElement.onclick = () => send("playFromID", activeProfile, sound.shortname, "100");
    document.getElementById("sounds-grid").appendChild(gridElement);
}
