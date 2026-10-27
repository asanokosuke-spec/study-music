


const songs = [
  {
    title: "サンプル曲A",
    artist: "サンプルアーティストA",
    bpm: 96,
    tempo: "slow",
    genre: "J-POP",
    vocal: "女性",
    tasks: ["暗記", "読解"],
    image: "song-a.jpg",
    url: "https://www.youtube.com/"
  },
  {
    title: "サンプル曲B",
    artist: "サンプルアーティストB",
    bpm: 125,
    tempo: "fast",
    genre: "J-POP",
    vocal: "男性",
    tasks: ["計算", "テスト"],
    image: "song-b.jpg",
    url: "https://www.youtube.com/"
  },
  {
    title: "サンプル曲C",
    artist: "サンプルアーティストC",
    bpm: 92,
    tempo: "slow",
    genre: "洋楽",
    vocal: "男性",
    tasks: ["暗記", "読解"],
    image: "song-c.jpg",
    url: "https://open.spotify.com/"
  },
  {
    title: "サンプル曲D",
    artist: "サンプルアーティストD",
    bpm: 130,
    tempo: "fast",
    genre: "洋楽",
    vocal: "女性",
    tasks: ["計算", "テスト"],
    image: "song-d.jpg",
    url: "https://open.spotify.com/"
  },
  {
    title: "サンプル曲E",
    artist: "サンプルアーティストE",
    bpm: 120,
    tempo: "medium",
    genre: "J-POP",
    vocal: "男性",
    tasks: ["計算", "テスト"],
    image: "song-e.jpg",
    url: "https://open.spotify.com/"
  },
  {
    title: "サンプル曲F",
    artist: "サンプルアーティストF",
    bpm: 110,
    tempo: "slow",
    genre: "J-POP",
    vocal: "女性",
    tasks: ["計算", "テスト"],
    image: "song-f.jpg",
    url: "https://open.spotify.com/"
  },
  {
    title: "サンプル曲G",
    artist: "サンプルアーティストG",
    bpm: 125,
    tempo: "fast",
    genre: "J-POP",
    vocal: "男性",
    tasks: ["計算", "テスト"],
    image: "song-g.jpg",
    url: "https://open.spotify.com/"
  },
  {
    title: "サンプル曲H",
    artist: "サンプルアーティストH",
    bpm: 120,
    tempo: "medium",
    genre: "J-POP",
    vocal: "女性",
    tasks: ["計算", "テスト"],
    image: "song-h.jpg",
    url: "https://open.spotify.com/"
  }
];
let showFavoritesOnly = false;

const showAllButton = document.querySelector("#showAllButton");
const showFavoritesButton = document.querySelector("#showFavoritesButton");
/* お気に入り機能 */

// 保存済みのお気に入りを読み込む
const FAVORITES_KEY = "studyMusicFavorites";

let favoriteTitles = new Set(
  JSON.parse(
    localStorage.getItem(FAVORITES_KEY) || "[]"
  )
);

// お気に入りを保存する
function saveFavorites() {
  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify([...favoriteTitles])
  );
}

const searchButton = document.querySelector("#searchButton");
const subjectInput = document.querySelector("#subject");
const taskInput = document.querySelector("#task");
const tempoInput = document.querySelector("#tempo");
const genreInput = document.querySelector("#genre");
const vocalInput = document.querySelector("#vocal");
const results = document.querySelector("#results");
const resultMessage = document.querySelector("#resultMessage");

searchButton.addEventListener("click", () => {
  const task = taskInput.value;
  const tempo = tempoInput.value;
  const genre = genreInput.value;
  const vocal = vocalInput.value;

  const matchedSongs = songs.filter(song => {
    const matchesTempo =
      tempo === "any" || song.tempo === tempo;

    const matchesGenre =
      genre === "any" || song.genre === genre;

    const matchesVocal =
      vocal === "any" || song.vocal === vocal;

    const matchesTask = song.tasks.includes(task);

    return (
      matchesTempo &&
      matchesGenre &&
      matchesVocal &&
      matchesTask &&
      (!showFavoritesOnly || favoriteTitles.has(song.title)) &&
      true
    );
  });

  results.replaceChildren();

  if (matchedSongs.length === 0) {
    resultMessage.textContent =
      "条件に合う曲がありません。別の条件を試してみてね。";
    return;
  }

  resultMessage.textContent =
    `${matchedSongs.length}曲見つかりました！`;

  matchedSongs.forEach(song => {
  const card = document.createElement("article");
  card.className = "song-card";


  // ジャケット画像
  const cover = document.createElement("img");
  cover.className = "song-cover";

  // imagesフォルダから画像を読み込む
  cover.src = `images/${song.image}`;
  cover.alt = `${song.title}のジャケット画像`;
  cover.loading = "lazy";

  // 画像が読み込めない場合は代替画像を表示
  cover.onerror = () => {
    cover.onerror = null;
    cover.src = "images/default-cover.png";
  };

  // 曲名
  const title = document.createElement("h3");
  title.textContent = song.title;

  // アーティスト名
  const artist = document.createElement("p");
  artist.className = "song-artist";
  artist.textContent = song.artist;

  // 曲の情報
  const details = document.createElement("p");
  details.className = "song-details";
  details.textContent =
    `BPM ${song.bpm} · ${song.genre} · ${song.vocal}ボーカル`;

  // 配信ページへのリンク
  const link = document.createElement("a");
  link.href = song.url;
  link.textContent = "曲を聴く ↗";
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  // お気に入りボタンを作る
  const favoriteButton = document.createElement("button");
  favoriteButton.className = "favorite-button";

  // 登録済みならハートを塗りつぶす
  function updateFavoriteButton() {
    const isFavorite = favoriteTitles.has(song.title);

    favoriteButton.textContent = isFavorite
      ? "♥ お気に入り登録済み"
      : "♡ お気に入り";

    favoriteButton.classList.toggle(
      "is-favorite",
      isFavorite
    );

    favoriteButton.setAttribute(
      "aria-pressed",
      String(isFavorite)
    );
  }

  // クリックで登録・解除
  favoriteButton.addEventListener("click", () => {
    if (favoriteTitles.has(song.title)) {
      favoriteTitles.delete(song.title);
    } else {
      favoriteTitles.add(song.title);
    }

    saveFavorites();
    updateFavoriteButton();
  });

  updateFavoriteButton();

card.append(
  cover,
  title,
  artist,
  details,
  favoriteButton,
  link
);
  results.append(card);
  });
});
const experimentResults = [
  {
    task: "計算",
    tempo: "slow",
    condition: "遅めの曲",
    averageCorrect: 46,
    averageFocus: 3.4,
    participants: 12
  },
  {
    task: "計算",
    tempo: "fast",
    condition: "速めの曲",
    averageCorrect: 43,
    averageFocus: 3.2,
    participants: 12
  }
];
showAllButton.addEventListener("click", () => {
  showFavoritesOnly = false;

  showAllButton.classList.add("active");
  showFavoritesButton.classList.remove("active");

  searchButton.click();
});

showFavoritesButton.addEventListener("click", () => {
  showFavoritesOnly = true;

  showFavoritesButton.classList.add("active");
  showAllButton.classList.remove("active");

  searchButton.click();
});
