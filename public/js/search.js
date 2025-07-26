function search() {
    const searchTerm = document.getElementById('searchInput').value;
    document.getElementById('result').innerHTML = `Search results for: ${searchTerm}`;
}

// Add event listener when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchButton').addEventListener('click', search);
}); 