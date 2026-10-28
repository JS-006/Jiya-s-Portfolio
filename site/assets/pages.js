/* pages.js — THE LIST OF PAGES (used by both the immersive and the classic scroll).
   ADD A PAGE: add one line here.  Optional  poster: 'posters/xx.jpg'  = preview shown while flying past. */
window.PAGES = [
  { src: 'pages/home.html', poster: 'posters/p01.jpg',  title: 'Home'  },
  { src: 'pages/icons.html', poster: 'posters/p02.jpg', title: 'Icons' },
  { src: 'pages/logo.html', poster: 'posters/p03.jpg',  title: 'Logo'  },
  // each full-page image is its own scroll step (pages/image.html shows one image)
  { src: 'pages/image.html?img=img/bg1.jpg', poster: 'posters/p04.jpg', title: '2D BG 1' },
  { src: 'pages/image.html?img=img/bg2.jpg', poster: 'posters/p05.jpg', title: '2D BG 2' },
  { src: 'pages/image.html?img=img/k1.jpg', poster: 'posters/p06.jpg',  title: 'Kanha 1' },
  { src: 'pages/image.html?img=img/k2.jpg', poster: 'posters/p07.jpg',  title: 'Kanha 2' },
  { src: 'pages/image.html?img=img/k3.jpg', poster: 'posters/p08.jpg',  title: 'Kanha 3' },
  { src: 'pages/image.html?img=img/humens.jpg', poster: 'posters/p09.jpg', title: 'Humens' },
  { src: 'pages/image.html?img=img/mesh.jpg', poster: 'posters/p10.jpg',   title: 'Mesh Tool' },
  { src: 'pages/image.html?img=img/pat1.jpg', poster: 'posters/p11.jpg',   title: 'Patterns 1' },
  { src: 'pages/image.html?img=img/pat2.jpg', poster: 'posters/p12.jpg',   title: 'Patterns 2' },
  { src: 'pages/video.html?v=video/intro.mp4&poster=video/poster.jpg', poster: 'posters/p13.jpg', title: 'Video' },
  { src: 'pages/image.html?img=img/seq1.jpg', poster: 'posters/p14.jpg', title: 'Future' },
  { src: 'pages/image.html?img=img/seq2.jpg', poster: 'posters/p15.jpg', title: 'Social Media Post' },
  { src: 'pages/image.html?img=img/seq3.jpg', poster: 'posters/p16.jpg', title: 'Stationery' },
  { src: 'pages/image.html?img=img/seq4.jpg', poster: 'posters/p17.jpg', title: 'Typography' },
  // { src: 'pages/page4.html', title: 'Page 4' },   <- your 4th file goes here
];
