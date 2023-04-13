const urlParams = new URLSearchParams(window.location.search);
const inviteKeyParam = urlParams.get("inviteKey");
const form = document.getElementById("squiggle-form");
const message = document.getElementById("message");

form.addEventListener("submit", function (event) {
    event.preventDefault();
    const author = document.getElementById("author").value;
    const datetime = new Date().toISOString();

    const requestBody = {
        inviteKey: inviteKeyParam,
        squiggle: {
            datetime,
            author,
        },
    };

    fetch("https://4ko9ppstm2.execute-api.us-west-2.amazonaws.com/prod/squiggle/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
    })
        .then((response) => {
            if (response.ok) {
                message.textContent = "Successfully submitted!";
                message.style.color = "green";
                form.reset();
            } else {
                throw new Error("Network response was not ok");
            }
        })
        .catch((error) => {
            message.textContent = "Error: " + error;
            message.style.color = "red";
        });
});