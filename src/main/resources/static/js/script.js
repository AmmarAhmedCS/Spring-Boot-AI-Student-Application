let messageTimeout;
function showMessage(msg) {
    const box = document.getElementById("messageBox");
    box.innerText = msg;
    box.classList.add("show");

    clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
        box.classList.remove("show");
    }, 3500);
}

function register() {
    const user = document.getElementById("regUser").value;
    const pass = document.getElementById("regPass").value;

    fetch(`/api/register?username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`, {
        method: 'POST'
    })
        .then(res => res.text())
        .then(data => showMessage(data));
}

function login() {
    const user = document.getElementById("loginUser").value;
    const pass = document.getElementById("loginPass").value;

    fetch(`/api/login?username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`, {
        method: 'POST'
    })
        .then(res => res.text())
        .then(data => {
            showMessage(data);

            if (data === "Login Successful") {
                window.location.href = "/dashboard";
            }
        });
}

function updatePassword() {
    const user = document.getElementById("upUser").value;
    const pass = document.getElementById("upPass").value;
    const newPass = document.getElementById("upNewPass").value;

    fetch(`/api/update?username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}&newPassword=${encodeURIComponent(newPass)}`, {
        method: 'POST'
    })
        .then(res => res.text())
        .then(data => showMessage(data));
}

function deleteAccount() {
    const user = document.getElementById("delUser").value;
    const pass = document.getElementById("delPass").value;

    fetch(`/api/delete?username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`, {
        method: 'POST'
    })
        .then(res => res.text())
        .then(data => showMessage(data));
}

function showAccounts() {
    fetch('/api/accounts')
        .then(res => res.json())
        .then(users => {
            const list = document.getElementById("accountList");
            list.innerHTML = "";

            if (users.length === 0) {
                showMessage("No Registered Accounts");
                return;
            }

            showMessage("Fetched " + users.length + " Account(s)");

            users.forEach(u => {
                const li = document.createElement("li");

                li.textContent =
                    "ID: " + u.id +
                    " | Username: " + u.username +
                    " | Password: " + u.password;

                list.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error:", error);
            showMessage("Error fetching accounts");
        });
}