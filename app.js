const apiKey = "AIzaSyAq5m8hfOGQwFxwqUP6oaY1HM9jyIvgc-0";
const cxId = "72d2ca21d3dbd424f";
const searchResultsDiv = document.getElementById("search-results");
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const externalSearchBtn = document.getElementById("external-search-btn");
const externalSearchDiv = document.querySelector(".external-search-div");
const navbar = document.querySelector("#navbar");

const resultsPerPage = 10;
let currentPage = 1;
let totalResults = 0;
let totalPages = 0;
let results;

/* FETCH DATA */
const baseUrl = "https://www.googleapis.com/customsearch/v1";
const fetchData = async () => {
  const start = (currentPage - 1) * resultsPerPage + 1;
  const params = {
    key: apiKey,
    cx: cxId,
    q: searchInput.value,
    siteSearch: "youtube.com",
    orTerms: "music",
    start: start.toString(), // `&${start.toString()}`
    num: resultsPerPage.toString(),
  };

  const response = await fetch(baseUrl + "?" + new URLSearchParams(params));
  const data = await response.json();
  results = data.items;
  totalResults = data.searchInformation.totalResults;
  totalPages = Math.ceil(totalResults / resultsPerPage);

  addItems();
};

/* BUTTON EVENT LISTENERS */
searchButton.addEventListener("click", (e) => {
  e.preventDefault();
  console.log(searchInput.value);

  // Clear previous search results
  searchResultsDiv.innerHTML = "";

  externalSearchDiv.style.display = searchInput.value ? "block" : "none";
  externalSearchBtn.innerHTML = `&nbsp;<i class="fa-solid fa-magnifying-glass"></i>&nbsp; Search&nbsp;<b>${searchInput.value}</b>&nbsp;on Google`;

  fetchData();
});

previousButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchData();
  }
});

nextButton.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchData();
  }
});

externalSearchDiv.addEventListener("click", () => {
  const encodedSearchValue = encodeURIComponent(searchInput.value);
  const googleSearchUrl = `https://www.google.com/search?q=${encodedSearchValue}`;

  // Open the Google search in a new tab
  window.open(googleSearchUrl, "_blank");
});

navbar.addEventListener('click', () => {
    location.reload()
})

/* ADD ITEMS/RESULTS */
function addItems() {
  // Clear previous search results
  searchResultsDiv.innerHTML = "";

  results.forEach((result) => {
    const resultDiv = document.createElement("div");
    resultDiv.classList.add("result");

    // Adds click event listener to each result div
    resultDiv.addEventListener("click", () => {
      showPreviewOverlay(result);
    });

    // Get video information
    const title = result.title;
    const channelName = result.pagemap?.person?.[0]?.name || "Unknown Artist";
    const view = result.pagemap?.videoobject?.[0]?.interactioncount || "N/A";
    const views = abbreviateNumber(view);
    const thumbnailUrl = result.pagemap?.cse_image?.[0]?.src || "";

    resultDiv.innerHTML = `
      <div>
          <img src="${thumbnailUrl}" alt="${title}">
      </div>
      <div class="info">
        <h4 class='info-title'>${title}</h4>
        <p class='info-artist'>Artist: ${channelName}</p>
        <div class='info-footer'>
          <span><i class="fa-brands fa-youtube" style="color: #f00000;"></i>Youtube.com</span>
          <p class='info-views'>Views: ${views}</p>
        </div>
      </div>
    `;

    // Append the <div> to the search results <div>
    searchResultsDiv.appendChild(resultDiv);
  });

  // Display current page number
  const pageInfo = document.getElementById("page-info");
  pageInfo.textContent = currentPage > 1 ? currentPage.toString() : "";
  pageInfo.style.display = currentPage > 1 ? "block" : "none";

  // Adjust visibility of previous and next buttons
  previousButton.style.display = currentPage > 1 ? "block" : "none";
  nextButton.style.display = currentPage < totalPages ? "block" : "none";
}

/*  OVERLAY  */
function showPreviewOverlay(result) {
  // Get video information
  const title = result.snippet;
  const channelName = result.pagemap?.person?.[0]?.name || "Unknown Artist";
  const view = result.pagemap?.videoobject?.[0]?.interactioncount || "N/A";
  const views = abbreviateNumber(view);
  const thumbnailUrl = result.pagemap?.cse_image?.[0]?.src || "";

   // Create -- overlay element
   const overlay = document.createElement("div");
   overlay.classList.add("overlay");
 
   // Create -- overlay content
   overlay.innerHTML = `
     <div class="center-div">
       <img src="${thumbnailUrl}" alt="${title}">
       <h4 class='overlay-title'>${title}</h4>
       <div class='overlay-details'>
         <p><i class="fa-brands fa-youtube" style="color: #f00000;"></i>${channelName}</p>
         <p>${views}</p>
       </div>
     </div>
     <div class="overlay-footer">
       <button class="visit-button">Visit</button>
       <button class="close-button">Close</button>
     </div>
   `;
 
   // Add click event listeners to buttons
   overlay.querySelector(".visit-button").addEventListener("click", () => {
     openVideoLink(result.link);
     closePreviewOverlay();
   });
   overlay.querySelector(".close-button").addEventListener("click", () => {
     closePreviewOverlay();
   });
 
   // Append overlay to the document body
   document.body.appendChild(overlay);
}

function closePreviewOverlay() {
  const overlay = document.querySelector(".overlay");
  if (overlay) {
    overlay.remove();
  }
}

function openVideoLink(link) {
  // Open the video link in a new tab
  window.open(link, "_blank");
}


/*  OTHERS  */
function abbreviateNumber(views) {
  if (views === "N/A") return;
  if (views >= 1000000000) {
    return (views / 1000000000).toFixed(1) + "B";
  } else if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M";
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K";
  } else {
    return views.toString();
  }
}
