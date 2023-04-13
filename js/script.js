const urlParams = new URLSearchParams(window.location.search);
const inviteKeyParam = urlParams.get("inviteKey");
const form = document.getElementById("squiggle-form");
const message = document.getElementById("message");

form.addEventListener("submit", function (event) {
    event.preventDefault();
    const author = document.getElementById("author").value;
    const datetime = new Date().toISOString();

    const request = {
        inviteKey: inviteKeyParam,
        squiggle: {
            datetime,
            author,
        },
    };
    const requestBody = JSON.stringify(request)

    console.log("Request:");
    console.log(requestBody);

    fetch("https://4ko9ppstm2.execute-api.us-west-2.amazonaws.com/prod/squiggle/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: requestBody,
    })
        .then((response) => {
            if (response.ok) {
                console.log("Success:");
                console.log(response);
                message.textContent = "Successfully submitted!";
                message.style.color = "green";
                form.reset();
            } else {
                throw new Error("Network response was not ok");
            }
        })
        .catch((error) => {
            console.log("Error:");
            console.log(error);
            message.textContent = "Error: " + error;
            message.style.color = "red";
        });
});