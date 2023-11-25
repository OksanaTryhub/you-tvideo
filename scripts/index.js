import { convertTime, formatDate } from "./helpers.js";

//ksanat
// const API_KEY = 'AIzaSyA4KZ-pF3I2sBJmGjw6pj1QfOYmBo-i8aw';
//tendresse
const API_KEY = 'AIzaSyADu18hLO2SOTOFYyr4PlAIum6f8-eXV_k';
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

const videoList = document.querySelector('.video-list');
const searchForm = document.querySelector('.search__form');
const searchPageTitle = document.querySelector('.video-gallery__title');
const searchVideoGallery = document.querySelector('.video-gallery');
const darkModeBtn = document.querySelector('.dark-mode-btn');

const favoriteVideoIds = JSON.parse(localStorage.getItem('favoriteYT') || "[]");

// Dark mode control 
// Проверка темной темы в системных настройках
if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
  darkModeBtn.classList.add('dark-mode-btn__active');
  document.body.classList.add('dark');
} 

// Проверка темной темы в localstorage
 if (localStorage.getItem('darkMode') === 'dark') {
  darkModeBtn.classList.add('dark-mode-btn__active');
  document.body.classList.add('dark');
 } else if (localStorage.getItem('darkMode') === 'light') {
  darkModeBtn.classList.remove('dark-mode-btn__active');
  document.body.classList.remove('dark');
}

// Если меняются системные настройки, меняем тему
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener('change', (e) => {
    const newColorScheme = e.matches ? 'dark' : 'light';

    if (newColorScheme === 'dark') {
      darkModeBtn.classList.add('dark-mode-btn__active');
      document.body.classList.add('dark');
      localStorage.setItem('darkMode', 'dark');
    } else {
      darkModeBtn.classList.remove('dark-mode-btn__active');
      document.body.classList.remove('dark');
      localStorage.setItem('darkMode', 'light');
    }
  })



darkModeBtn.onclick = () => {
  darkModeBtn.classList.toggle('dark-mode-btn__active');
  const isDark = document.body.classList.toggle('dark');

  if (isDark) {
    localStorage.setItem('darkMode', 'dark');
  } else {
    localStorage.setItem('darkMode', 'light');
  }
}

// Receiving data from API
const fetchTrendingVideos = async () => {
  try {
    const url = new URL(VIDEOS_URL);
    url.searchParams.append('part', 'contentDetails, id, snippet');
    url.searchParams.append('chart', 'mostPopular');
    url.searchParams.append('regionCode', 'UA');
    url.searchParams.append('maxResults', '12');
    url.searchParams.append('pageInfo', '2');
    url.searchParams.append('key', API_KEY);

    const response = await fetch(url);

    if (!response) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
    
  } catch (error) {
    console.error('error: ', error);
  }
}

const fetchFavoriteVideos = async () => {
  try {
    if (favoriteVideoIds.lenght === 0) {
      return { items: [] }
    };

    const url = new URL(VIDEOS_URL);
    url.searchParams.append('part', 'contentDetails, id, snippet');
    url.searchParams.append('maxResults', '12');
    url.searchParams.append('id', favoriteVideoIds.join(","));
    url.searchParams.append('key', API_KEY);

    const response = await fetch(url);

    if (!response) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
    
  } catch (error) {
    console.error('error: ', error);
  }
}

const fetchVideo = async (id) => {
  try {  
    const url = new URL(VIDEOS_URL);
    url.searchParams.append('part', 'contentDetails, id, snippet, statistics');
    url.searchParams.append('id', id);
    url.searchParams.append('key', API_KEY);

    const response = await fetch(url);

    if (!response) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
    
  } catch (error) {
    console.error('error: ', error);
  }
}

const fetchVideosByKeyword = async (query, excludedId) => {
  try {
    const url = new URL(SEARCH_URL);
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('q', query);
    url.searchParams.append('type', "video");
    url.searchParams.append('maxResults', '12');
    url.searchParams.append('pageInfo', '');
    url.searchParams.append('key', API_KEY);
    
    const response = await fetch(url);

    if (!response) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();

    if (excludedId) {
      data.items = data.items.filter(item => item.id.videoId !== excludedId);
    }

    return data;
    
  } catch (error) {
    console.error('error: ', error);
    throw error;
  }
}

// Rendering functions
const renderListVideos = (videos) => {
  videoList.textContent = "";

  let renderedVideos;
  if (videos.items) {
    renderedVideos = videos.items
  } else {
    renderedVideos = videos
  }

  const videoGallery = renderedVideos.map(video => {
    let id;
    if (typeof video.id === 'string') {
      id = video.id;
    } else {
      id = video.id.videoId;
    }
  
    const li = document.createElement('li');
    li.classList.add('video-list__item');

    li.innerHTML = `
    <article class="video-card">
      <a href="/video.html?id=${id}" class="video-card__link">
        <img class="video-card__cover"  src="${video.snippet.thumbnails.standart?.url ||
      video.snippet.thumbnails.high?.url
      }" alt="${video.snippet.title} cover"/>
        <div>
          <h3 class="video-card__title">${video.snippet.title}</h3>
          <p class="video-card__channel">${video.snippet.channelTitle}</p>
          ${video.contentDetails
        ? `<p class="video-card__duration">${convertTime(video.contentDetails.duration)}</p>`
        : ""
      }          
        </div>
      </a>
      <button 
        class="video-card__favorite favorite ${favoriteVideoIds.includes(video.id) ? 'active' : ''}" 
        type="button" 
        aria-label="Добавить в избранное ${video.snippet.title}"
        data-video-id="${id}">
        <svg class="video-card__favorite-icon" viewBox="0 0 20 20" role="img" aria-label="Favorite videos">
          <use class="star-o" xlink:href="/images/sprite.svg#star-black" />
          <use class="star" xlink:href="/images/sprite.svg#star-orange" />
        </svg>
      </button>
    </article>
  `;
    return li;
  })

  videoList.append(...videoGallery);
};

const renderVideo = async ({items: [video]}) => { 
  const videoElem = document.querySelector('.video');

  let id;
  if (typeof video.id === 'string') {
    id = video.id;
  } else {
    id = video.id.videoId;
    }

  videoElem.innerHTML = `
    <div class="container">
      <div class="video__player">
        <iframe class="video__iframe" src="https://www.youtube.com/embed/${id}"
          title="YouTube video player" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen></iframe>
      </div>
      <div class="video__content">
        <button
          class="video__favorite-btn favorite ${favoriteVideoIds.includes(id) ? 'active' : ''}" 
          type="button"
          aria-label="Добавить в избранное ${video.snippet.title}" 
          data-video-id="${id}" 
        >
        <span class="video__content--text">
          <p class="star">В избранном</p>
          <p class="star-o">Добавить в избранное</p>
        </span>
          <svg class=" video__favorite-icon" viewBox="0 0 20 20" role="img" aria-label="Favorite video">
            <use class="star" xlink:href="/images/sprite.svg#star-orange" />
            <use class="star-o" xlink:href="/images/sprite.svg#star-black" />
          </svg>
        </button>

        <div class="video__details">
          <h3 class="video__details--title">${video.snippet.title}</h3>
          <p class="video__details--channel">${video.snippet.channelTitle}</p>
          <p class="video__details--info">
            <span class="video__details--views">${parseInt(video.statistics.viewCount).toLocaleString("uk-UK")} просмотр</span>
            <span class="video__details--date">Дата премьеры: ${formatDate(video.snippet.publishedAt)}</span>
          </p>
          <p class="video__details--description">${video.snippet.description}</p>
        </div>
      </div>
    </div>
  `

  const relatedVideoSearchQuery = video.snippet.title;
  const mainVideoId = id;
  try{
    const relatedVideos = await fetchVideosByKeyword(relatedVideoSearchQuery, mainVideoId);
  // let filteredVideos = relatedVideos.items.filter(video => video.id.videoId !== mainVideoId);

    if (!relatedVideos.items || relatedVideos.items.length === 0) {
      searchVideoGallery.append('Oops... There are no similar videos... Try again...')
    }

    renderListVideos(relatedVideos);
    } catch (error) {
    console.error('Error fetching and rendering related videos: ', error);
    }
}


searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // const searchInput = document.querySelector('.search__form--input');
  // const keyword = searchInput.value.trim();
  const keyword = searchForm.search.value.trim();

  if (keyword !== '') {
    try {
      window.location.href = `/search.html?q=${keyword}`;  
    } catch (error) {
      console.error('Error searching videos: ', error);
    }
  } else {
    swal("Please enter a search keyword", {
      dangerMode: true,
    });
  }
});

const init = () => {
  const currentPage = location.pathname;
  const urlSearchParams = new URLSearchParams(location.search);
  const videoId = urlSearchParams.get('id');
  const searchQuery = urlSearchParams.get('q');

  if (currentPage === '/' || currentPage === '') {
    fetchTrendingVideos().then(renderListVideos);
  } else if (currentPage === '/video.html' && videoId) {
    fetchVideo(videoId).then(renderVideo);
    fetchVideosByKeyword(searchQuery).then(renderListVideos);
  } else if (currentPage === '/favorite.html') {
    fetchFavoriteVideos().then(renderListVideos);
  } else if (currentPage === '/search.html' && searchQuery) {
    searchPageTitle.textContent = `Search results for "${searchQuery}"`;
    fetchVideosByKeyword(searchQuery).then(renderListVideos);
  }

  document.body.addEventListener('click', ({ target }) => {
    const itemFavorite = target.closest(".favorite");

    if (itemFavorite) {
      const videoId = itemFavorite.dataset.videoId;

      if (favoriteVideoIds.includes(videoId)) {
        favoriteVideoIds.splice(favoriteVideoIds.indexOf(videoId), 1);
        localStorage.setItem("favoriteYT", JSON.stringify(favoriteVideoIds));
        itemFavorite.classList.remove('active');
        if (currentPage === '/favorite.html') {
          fetchFavoriteVideos().then(renderListVideos);
        }
        
      } else {
        favoriteVideoIds.push(videoId);
        localStorage.setItem("favoriteYT", JSON.stringify(favoriteVideoIds));
        itemFavorite.classList.add('active');
      }
    }
  })
}

init();