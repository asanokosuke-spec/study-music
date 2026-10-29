import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";


import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNTj1L72JASja7fZcvo2y1oRsdpauaZyk",
  authDomain: "studymusic-8f497.firebaseapp.com",
  projectId: "studymusic-8f497",
  storageBucket: "studymusic-8f497.firebasestorage.app",
  messagingSenderId: "107420583191",
  appId: "1:107420583191:web:50a1cf5cf32288d965e352",
  measurementId: "G-X92V43CL3N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

signInAnonymously(auth).catch((error) => {
  console.error("認証エラー:", error);
});

const songs = [
  {
    title: "サンプル曲A",
    artist: "サンプルアーティストA",
    bpm: 96,
    tempo: "slow",
    genre: "J-POP",
    vocal: "女性",
    tasks: ["暗記", "読解"],
    image: "images/song-a.jpg",
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
    image: "images/song-b.jpg",
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
    image: "images/song-c.jpg",
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
    image: "images/song-d.jpg",
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
    image: "images/song-e.jpg",
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
    image: "images/song-f.jpg",
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
    image: "images/song-g.jpg",
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
    image: "images/song-h.jpg",
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

const commentsCollection = collection(db, "comments");

// コメントを表示する

function displayComments(song, commentList, commentHeading) {
  const commentsQuery = query(
    commentsCollection,
    where("songId", "==", song.title)
  );

  const unsubscribeComments = onSnapshot(
    commentsQuery,
    (snapshot) => {
      // 古いいいねの監視を停止
      commentList._unsubscribeLikes?.forEach(unsubscribe => {
        unsubscribe();
      });
      commentList._unsubscribeLikes = [];

      commentList.replaceChildren();

      const comments = snapshot.docs
        .map(documentSnapshot => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data()
        }))
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() ?? 0;
          const timeB = b.createdAt?.toMillis?.() ?? 0;
          return timeB - timeA;
        });
        commentHeading.textContent =
        `💬 みんなのコメント（${comments.length}件）`;
      if (comments.length === 0) {
        const message = document.createElement("p");
        message.textContent = "まだコメントはありません。";
        commentList.append(message);
        return;
      }

      comments.forEach(comment => {
        const item = document.createElement("div");
        item.className = "comment-item";

        const nickname = document.createElement("strong");
        nickname.textContent = comment.nickname;

        const text = document.createElement("p");
        text.textContent = comment.text;
        
        // 投稿日時
        const date = document.createElement("time");
        date.className = "comment-date";

        const postedAt = comment.createdAt?.toDate?.();

        if (postedAt) {
           date.dateTime = postedAt.toISOString();
           date.textContent = new Intl.DateTimeFormat("ja-JP", {
             year: "numeric",
             month: "2-digit",
             day: "2-digit",
             hour: "2-digit",
             minute: "2-digit"
           }).format(postedAt);
        } else {
          date.textContent = "日時を取得中…";
      }
      // 自分のコメントだけ削除ボタンを表示
      let deleteButton = null;

      if (currentUser && comment.userId === currentUser.uid) {
        deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-comment-button";
        deleteButton.textContent = "🗑 コメントを削除";

        deleteButton.addEventListener("click", async () => {
          if (!confirm("このコメントを削除しますか？")) {
            return;
      }

      deleteButton.disabled = true;

      try {
        await deleteDoc(doc(db, "comments", comment.id));
      } catch (error) {
        console.error("コメント削除エラー:", error);
        alert("削除できませんでした。");
        deleteButton.disabled = false;
      }
      });
      }
        // いいねボタン
        const likeButton = document.createElement("button");
        likeButton.type = "button";
        likeButton.className = "like-button";
        likeButton.textContent = "♡ いいね";

        // いいね数
        const likeCount = document.createElement("span");
        likeCount.className = "like-count";
        likeCount.textContent = "0 いいね";

        const likeRefForCurrentUser = () => {
          if (!currentUser) return null;

          return doc(
            db,
            "comments",
            comment.id,
            "likes",
            currentUser.uid
          );
        };

        likeButton.addEventListener("click", async () => {
          if (!currentUser) {
            alert("接続準備中です。少し待ってから試してね。");
            return;
          }

          const alreadyLiked =
            likeButton.dataset.liked === "true";

          likeButton.disabled = true;

          try {
            const likeRef = likeRefForCurrentUser();

            if (alreadyLiked) {
              await deleteDoc(likeRef);
            } else {
              await setDoc(likeRef, {
                createdAt: serverTimestamp()
              });
            }
          } catch (error) {
            console.error("いいねエラー:", error);
            alert("いいねを更新できませんでした。");
          } finally {
            likeButton.disabled = false;
          }
        });

        // いいね数と、自分が押したかどうかを監視
        const likesCollection = collection(
          db,
          "comments",
          comment.id,
          "likes"
        );

        const unsubscribeLikes = onSnapshot(
          likesCollection,
          (likesSnapshot) => {
            likeCount.textContent =
              `${likesSnapshot.size} いいね`;

            const liked = currentUser
              ? likesSnapshot.docs.some(
                  like => like.id === currentUser.uid
                )
              : false;

            likeButton.dataset.liked = String(liked);
            likeButton.textContent = liked
              ? "♥ いいね済み"
              : "♡ いいね";

            likeButton.classList.toggle("is-liked", liked);
          },
          error => {
            console.error("いいね取得エラー:", error);
          }
        );

        commentList._unsubscribeLikes.push(unsubscribeLikes);

        item.append(
          nickname,
          text,
          date,
          likeButton,
          likeCount
        );
        if (deleteButton) {
          item.append(deleteButton);
       }
        commentList.append(item);
      });
    },
    error => {
      console.error("コメント取得エラー:", error);
      commentList.textContent =
        "コメントを読み込めませんでした。";
    }
  );

  return unsubscribeComments;
}


// コメントを投稿する
async function postComment(song, nicknameInput, commentInput, postButton) {
  const nickname = nicknameInput.value.trim();
  const text = commentInput.value.trim();

  if (!currentUser) {
    alert("接続準備中です。少し待ってから試してね。");
    return;
  }

  if (!nickname || !text) {
    alert("ニックネームとコメントを入力してね。");
    return;
  }

  if (nickname.length > 30 || text.length > 300) {
    alert("ニックネームは30文字、コメントは300文字以内にしてね。");
    return;
  }

  postButton.disabled = true;

  try {
    await addDoc(commentsCollection, {
      songId: song.title,
      nickname,
      text,
      userId: currentUser.uid,
      createdAt: serverTimestamp()
    });

    commentInput.value = "";
  } catch (error) {
    console.error("コメント投稿エラー:", error);
    alert("投稿できませんでした。ブラウザのコンソールを確認してね。");
  } finally {
    postButton.disabled = false;
  }
}

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
cover.src = song.image || "images/default-cover.jpg";

cover.onerror = () => {
  cover.onerror = null;
  cover.src = "images/default-cover.jpg";
};
cover.onerror = () => {
  cover.onerror = null;
  cover.src = "images/default-cover.jpg";
};  cover.alt = `${song.title}のジャケット画像`;
  cover.loading = "lazy";

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



  // コメント欄
  const commentSection = document.createElement("section");
  commentSection.className = "comment-section";

  // 開閉ボタン
  const toggleCommentsButton = document.createElement("button");
  toggleCommentsButton.type = "button";
  toggleCommentsButton.className = "toggle-comments-button";
  toggleCommentsButton.textContent = "💬 みんなのコメントを開く";

  // コメント欄の中身をまとめる
  const commentContent = document.createElement("div");
  commentContent.className = "comment-content";
  commentContent.hidden = true;

  const commentHeading = document.createElement("h4");
  commentHeading.textContent = "💬 みんなのコメント";

  const nicknameInput = document.createElement("input");
  nicknameInput.type = "text";
  nicknameInput.placeholder = "ニックネーム（30文字以内）";
  nicknameInput.maxLength = 30;

  const commentInput = document.createElement("textarea");
  commentInput.placeholder = "この曲で勉強した感想を書こう！（300文字以内）";
  commentInput.maxLength = 300;
  commentInput.rows = 3;

  const postButton = document.createElement("button");
  postButton.type = "button";
  postButton.textContent = "コメントを投稿";

  const commentList = document.createElement("div");
  commentList.className = "comment-list";

  postButton.addEventListener("click", () => {
    postComment(song, nicknameInput, commentInput, postButton);
  });

  // 開く・閉じる
  toggleCommentsButton.addEventListener("click", () => {
    const isOpening = commentContent.hidden;
    commentContent.hidden = !isOpening;

    toggleCommentsButton.textContent = isOpening
      ? "💬 コメントを閉じる"
      : "💬 みんなのコメントを開く";
  });

  commentContent.append(
    commentHeading,
    nicknameInput,
    commentInput,
    postButton,
    commentList
  );

  commentSection.append(
    toggleCommentsButton,
    commentContent
  );

  card.append(
    cover,
    title,
    artist,
    details,
    favoriteButton,
    link,
    commentSection
  );

  results.append(card);

  displayComments(song, commentList, commentHeading);

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
