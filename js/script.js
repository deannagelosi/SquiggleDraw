const urlParams = new URLSearchParams(window.location.search);
const inviteKeyParam = urlParams.get("inviteKey");
const form = document.getElementById("squiggle-form");
const message = document.getElementById("message");

form.addEventListener("submit", async function (event) {
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

    const response = await fetch("https://4ko9ppstm2.execute-api.us-west-2.amazonaws.com/prod/squiggle/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: requestBody,
    });

    if (response.ok) {
        const jsonResponse = await response.json();
        console.log("Success:", jsonResponse);
        message.textContent = "Successfully submitted!";
        message.style.color = "green";
        form.reset();
    } else {
        console.log("Error:");
        console.log(response);
        message.textContent = "Error";
        message.style.color = "red";
    }
});