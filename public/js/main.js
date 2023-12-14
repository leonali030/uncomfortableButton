// Assuming you have a way to get the current user and rock data
// Update the DOM with the user information
document.getElementById('userInfo').innerText = `Logged in as ${currentUser}`;

// Handle the 'Felt Uncomfortable' button click
document.getElementById('uncomfortableButton').addEventListener('click', function() {
    // Update the rock status
    currentRock.clicks += 1;
    let percentage = (currentRock.initialValue - currentRock.clicks * 10) / currentRock.initialValue * 100;
    document.getElementById('rockStatus').innerText = `Current progress of rock hitting: ${percentage}%`;
    
    // Check if the rock has cracked open
    if (percentage <= 0) {
        // Assign a new rock and update the jade value
        currentRock = assignNewRock();
        updateUserJade();
    }
});

function assignNewRock() {
    // Logic to assign a new rock with initial value between 10 and 500
}

function updateUserJade() {
    // Update the user's jade value
}
