import { convertTime, formatDate } from "./helpers.js";

const API_KEY = 'AIzaSyA4KZ-pF3I2sBJmGjw6pj1QfOYmBo-i8aw';
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

const videoList = document.querySelector('.video-list');
const favoriteVideoIds = JSON.parse(localStorage.getItem('favoriteYT') || "[]");

const fetchTrendingVideos = async () => {
  try {
    const url = new URL(VIDEOS_URL);
    url.searchParams.append('part', 'contentDetails, id, snippet');
    url.searchParams.append('chart', 'mostPopular');
    url.searchParams.append('regionCode', 'UA');
    url.searchParams.append('maxResults', '12');
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
    if (favoriteVideoIds.length === 0) {
      return { items: [] }
    };

    const url = new URL(VIDEOS_URL);
    url.searchParams.append('part', 'contentDetails, id, snippet, statistics');
    url.searchParams.append('maxResults', '12');
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

const renderListVideos = (videos) => {
  videoList.textContent = "";

  const videoGallery = videos.items.map(video => {
    
  const formattedDuration = convertTime(video.contentDetails.duration);
  
  const li = document.createElement('li');
  li.classList.add('video-list__item');

  li.innerHTML = `
    <article class="video-card">
      <a href="/video.html?id=${video.id}" class="video-card__link">
        <img class="video-card__cover"  src="${
            video.snippet.thumbnails.standart?.url ||
            video.snippet.thumbnails.high?.url
            }" alt="${video.snippet.title} cover"/>
        <div>
          <h3 class="video-card__title">${video.snippet.title}</h3>
          <p class="video-card__channel">${video.snippet.channelTitle}</p>
          <p class="video-card__duration">${formattedDuration}</p>
        </div>
      </a>
      <button 
        class="video-card__favorite favorite ${favoriteVideoIds.includes(video.id) ? 'active' : ''}" 
        type="button" 
        aria-label="Добавить в избранное ${video.snippet.title}"
        data-video-id="${video.id}">
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
}

const renderVideo = ({items: [video]}) => {
  const videoElem = document.querySelector('.video');

  videoElem.innerHTML = `
    <div class="container">
      <div class="video__player">
        <iframe class="video__iframe" src="https://www.youtube.com/embed/${video.id}"
          title="YouTube video player" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen></iframe>
      </div>
      <div class="video__content">
        <button
          class="video__favorite-btn favorite ${favoriteVideoIds.includes(video.id) ? 'active' : ''}" 
          type="button"
          aria-label="Добавить в избранное ${video.snippet.title}" 
          data-video-id="${video.id}" 
        >
        <span>
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

}

const init = () => {
  const currentPage = location.pathname.split('/').pop();
  const urlSearchParams = new URLSearchParams(location.search);
  // console.log('urlSearchParams: ', urlSearchParams);
  const videoId = urlSearchParams.get('id');

  const searchQuery = urlSearchParams.get('q');
  
  if (currentPage === 'index.html' || currentPage === '') {
    fetchTrendingVideos().then(renderListVideos);
  } else if (currentPage === 'video.html' && videoId) {
    fetchVideo(videoId).then(renderVideo);
  } else if (currentPage === 'favorite.html') {
    fetchFavoriteVideos().then(renderListVideos);
  } else if (currentPage === 'search.html' && searchQuery) {
    console.log('currentPage: ', currentPage);
  }

  document.body.addEventListener('click', ({ target }) => {
    const itemFavorite = target.closest(".favorite");

    if (itemFavorite) {
      const videoId = itemFavorite.dataset.videoId;

      if (favoriteVideoIds.includes(videoId)) {
        favoriteVideoIds.splice(favoriteVideoIds.indexOf(videoId), 1);
        localStorage.setItem("favoriteYT", JSON.stringify(favoriteVideoIds));
        itemFavorite.classList.remove('active');
        
      } else {
        favoriteVideoIds.push(videoId);
        localStorage.setItem("favoriteYT", JSON.stringify(favoriteVideoIds));
        itemFavorite.classList.add('active');
      }
    }
  })
}

init();