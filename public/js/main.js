// Function to update hit history
function updateHitHistory() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.log('User not logged in');
        return;
    }

    fetch(`/api/hit-history?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('dailyHits').innerText = data.daily;
            document.getElementById('monthlyHits').innerText = data.monthly;
            document.getElementById('totalHits').innerText = data.total;
        })
        .catch(error => console.error('Error fetching hit history:', error));
}

// Function to fetch and display rock hitting progress
function fetchRockHittingProgress() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        return;
    }

    fetch(`/api/rock-hitting-progress?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            const progressPercentage = parseFloat(((data.currentHits / data.hitsRequired) * 100).toFixed(2));
            document.getElementById('rockStatus').innerText = `Current progress of rock hitting: ${progressPercentage}%`;
            document.getElementById('rockStatus').style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('rockStatus').style.display = 'none';
        });
}

function updateJadeInfo() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.log('User not logged in');
        return;
    }

    fetch(`/api/jades-history?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            const jadeList = document.getElementById('jadeList');
            jadeList.innerHTML = ''; // Clear existing list

            data.forEach(jade => {
                const listItem = document.createElement('li');
                listItem.innerText = `${jade.type}: ${jade.jadeCount} - ${jade.totalValue}`;
                jadeList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching jade info:', error));
}

// Function to update UI on login
function updateUIOnLogin(username) {
    document.getElementById('userInfo').style.display = 'block';
    document.getElementById('userInfo').innerText = 'Hi ' + username;
    document.getElementById('registerFormContainer').style.display = 'none';
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'block';
    document.getElementById('uncomfortableButton').style.display = 'block';
    document.getElementById('hitHistory').style.display = 'block';
    document.getElementById('jadeInfo').style.display = 'block';
    fetchRockHittingProgress();
    updateHitHistory();
    updateJadeInfo();
}

// Function to update UI on logout
function updateUIOnLogout() {
    document.getElementById('registerFormContainer').style.display = 'block';
    document.getElementById('loginFormContainer').style.display = 'block';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'none';
    document.getElementById('uncomfortableButton').style.display = 'none';
    document.getElementById('rockStatus').style.display = 'none';
    document.getElementById('hitHistory').style.display = 'none';
    document.getElementById('jadeInfo').style.display = 'none';
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const loggedInUsername = sessionStorage.getItem('username');
    if (loggedInUsername) {
        updateUIOnLogin(loggedInUsername);
    } else {
        updateUIOnLogout();
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
                sessionStorage.setItem('userId', data.userId);
                updateUIOnLogin(formData.get('username'));
                // Reload the page after successful registration
                window.location.reload();
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
                sessionStorage.setItem('userId', data.userId);
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
        const userId = sessionStorage.getItem('userId'); // Retrieve the user name
        if (!userId) {
            alert("You must be logged in to perform this action.");
            return;
        }

        fetch('/api/hit-rock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('rockStatus').innerText = `Current progress of rock hitting: ${data.newStatus}%`;
                updateHitHistory()
                updateJadeInfo()
            } else {
                console.error('Error:', data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });




});
