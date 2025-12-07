const API_URL = 'http://localhost:3000/movies';

const movieListDiv = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');
const form = document.getElementById('add-movie-form');

let allMovies = [];

function escapeHTML(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMovies(movies) {
    movieListDiv.innerHTML = '';

    if (movies.length === 0) {
        movieListDiv.innerHTML = '<p>No movies found.</p>';
        return;
    }

    movies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.classList.add('movie-item');

        movieDiv.innerHTML = `
            <p><strong>${escapeHTML(movie.title)}</strong> (${movie.year}) - ${escapeHTML(movie.genre)}</p>
            <div>
                <button class="edit-btn" data-id="${movie.id}">Edit</button>
                <button class="delete-btn" data-id="${movie.id}">Delete</button>
            </div>
        `;

        movieListDiv.appendChild(movieDiv);
    });

    attachButtonEvents();
}

function attachButtonEvents() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = () => openEditModal(btn.dataset.id);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = () => deleteMovie(btn.dataset.id);
    });
}

function fetchMovies() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            allMovies = data;
            renderMovies(allMovies);
        })
        .catch(err => console.error("Fetch error:", err));
}

fetchMovies();

// SEARCH
searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();

    const filtered = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(term) ||
        movie.genre.toLowerCase().includes(term)
    );

    renderMovies(filtered);
});

// ADD MOVIE
form.addEventListener('submit', e => {
    e.preventDefault();

    const newMovie = {
        title: document.getElementById('title').value.trim(),
        genre: document.getElementById('genre').value.trim(),
        year: parseInt(document.getElementById('year').value)
    };

    if (!newMovie.title || !newMovie.year) {
        alert("Title and Year are required.");
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMovie)
    })
    .then(res => res.json())
    .then(() => {
        form.reset();
        fetchMovies();
    });
});

// EDIT MODAL
function openEditModal(id) {
    const movie = allMovies.find(m => m.id == id);
    if (!movie) return;

    const modal = document.createElement("div");
    modal.classList.add("modal-overlay");

    modal.innerHTML = `
        <div class="modal">
            <h3>Edit Movie</h3>
            <input id="edit-title" value="${movie.title}">
            <input id="edit-genre" value="${movie.genre}">
            <input id="edit-year" type="number" value="${movie.year}">
            <div class="modal-buttons">
                <button id="save-edit">Save</button>
                <button id="cancel-edit">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("cancel-edit").onclick = () => modal.remove();

    document.getElementById("save-edit").onclick = () => {
        const updated = {
            title: document.getElementById("edit-title").value,
            genre: document.getElementById("edit-genre").value,
            year: parseInt(document.getElementById("edit-year").value)
        };

        updateMovie(id, updated);
        modal.remove();
    };
}

// UPDATE MOVIE
function updateMovie(movieId, updatedMovieData) {
    fetch(`${API_URL}/${movieId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMovieData),
    })
    .then(res => res.json())
    .then(() => fetchMovies())
    .catch(err => console.error("PUT error:", err));
}

// DELETE MOVIE
function deleteMovie(movieId) {
    fetch(`${API_URL}/${movieId}`, {
        method: 'DELETE',
    })
    .then(() => fetchMovies())
    .catch(err => console.error("DELETE error:", err));
}
