// Function to update UI on login
function updateUIOnLogin(username) {
    document.getElementById('userInfo').innerText = 'Hi ' + username;
    document.getElementById('registerFormContainer').style.display = 'none';
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'block';
    document.getElementById('uncomfortableButton').style.display = 'block';
    document.getElementById('rockStatus').style.display = 'block';
}

// Function to update UI on logout
function updateUIOnLogout() {
    document.getElementById('registerFormContainer').style.display = 'block';
    document.getElementById('loginFormContainer').style.display = 'block';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'none';
    document.getElementById('uncomfortableButton').style.display = 'none';
    document.getElementById('rockStatus').style.display = 'none';
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const loggedInUsername = sessionStorage.getItem('username');
    if (loggedInUsername) {
        updateUIOnLogin(loggedInUsername);
    }

    // Handle Registration Form Submission
    document.getElementById('registerForm').addEventListener('submit', function(event) {
        event.preventDefault();
       
        const formData = new FormData(this);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        fetch('/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sessionStorage.setItem('username', formData.get('username'));
                sessionStorage.setItem('userid', data.userid);
                updateUIOnLogin(formData.get('username'));
            } else {
                alert('Registration failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });


    // Handle Login Form Submission
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        fetch('/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sessionStorage.setItem('username', formData.get('username'));
                sessionStorage.setItem('userid', data.userid);
                updateUIOnLogin(formData.get('username'));
            } else {
                alert('Login failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Handle Logout
    document.getElementById('logoutButton').addEventListener('click', function() {
        fetch('/user/logout', {
            method: 'GET'
        })
        .then(response => response.text())
        .then(data => {
            sessionStorage.removeItem('username');
            updateUIOnLogout();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Handle the 'Felt Uncomfortable' Button Click
    document.getElementById('uncomfortableButton').addEventListener('click', function() {
        const userid = sessionStorage.getItem('userid'); // Retrieve the user name
        console.log(userid);
        if (!userid) {
            alert("You must be logged in to perform this action.");
            return;
        }

        fetch('/api/hit-rock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userid })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('rockStatus').innerText = `Current progress of rock hitting: ${data.newStatus}%`;
            } else {
                console.error('Error:', data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});
