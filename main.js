"use strict";

// local server for testing, render server for the live site
const API_URL =
    location.hostname === "localhost"
        ? "http://localhost:5000/api/v1/jokes"
        : "https://fast-jokes-sandesh.onrender.com/api/v1/jokes";

async function getJokes() {
    const button = document.querySelector("#btnAmuse");
    const status = document.querySelector("#status");
    const jokeId = document.querySelector("#jokeId").value.trim();

    // a joke number wins over the other choices
    let url;
    if (jokeId !== "") {
        url = `${API_URL}/${jokeId}`;
    } else {
        const language = document.querySelector("#selLang").value;
        const category = document.querySelector("#selCat").value;
        const number = document.querySelector("#selNum").value;
        url = `${API_URL}/${language}/${category}/${number}`;
    }

    button.disabled = true;
    button.classList.add("is-loading");
    status.textContent = "";
    // free servers go to sleep.. tell people why its slow
    const slowNote = setTimeout(() => {
        status.textContent = "The server is waking up. This can take up to a minute.";
    }, 3000);

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) {
            showError(data.detail ?? data.error ?? `Request failed with status ${response.status}`);
        } else if (data.jokes) {
            showJokes(data.jokes);
        } else {
            // the server sends a joke object, just the text matters here
            showJokes([typeof data.joke === "string" ? data.joke : data.joke.text]);
        }
    } catch {
        showError("Could not reach the joke server. Check the internet and try again.");
    } finally {
        clearTimeout(slowNote);
        status.textContent = "";
        button.disabled = false;
        button.classList.remove("is-loading");
    }
}

function showJokes(jokes) {
    const container = document.querySelector("#jokes");
    // build everything first and add it once, there can be 953 of them
    const fragment = document.createDocumentFragment();
    for (const joke of jokes) {
        const article = document.createElement("article");
        article.classList.add("box", "joke");
        const text = document.createElement("p");
        text.textContent = joke;
        article.appendChild(text);
        fragment.appendChild(article);
    }
    container.replaceChildren(fragment);
}

function showError(message) {
    const article = document.createElement("article");
    article.classList.add("box", "joke", "joke-error");
    article.textContent = `Error: ${message}`;
    document.querySelector("#jokes").replaceChildren(article);
}

document.querySelector("#btnAmuse").addEventListener("click", getJokes);
// enter in the joke number box should not reload the page
document.querySelector("#jokeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    getJokes();
});
