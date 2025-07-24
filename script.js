const gallery = document.querySelector('.gallery');
const lightbox = document.querySelector('.lightbox');
const lightboxImage = document.querySelector('.lightbox-image');
const closeBtn = document.querySelector('.close-btn');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

const imageList = [];
for (let i = 1; i <= 12; i++) {
  imageList.push(`bild${i}.jpg`);
}

let currentImageIndex = 0;

function renderGallery() {
  for (let i = 0; i < imageList.length; i++) {
    const img = document.createElement('img');
    img.src = imageList[i];
    img.alt = `Bild ${i + 1}`;
    img.onclick = function () {
      openLightbox(i);
    };
    gallery.appendChild(img);
  }
}

function openLightbox(index) {
  currentImageIndex = index;
  lightboxImage.src = imageList[currentImageIndex];
  lightbox.classList.add('active');
}

function closeLightbox() {
  lightbox.classList.remove('active');
}

function showPreviousImage() {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    lightboxImage.src = imageList[currentImageIndex];
  }
}

function showNextImage() {
  if (currentImageIndex < imageList.length - 1) {
    currentImageIndex++;
    lightboxImage.src = imageList[currentImageIndex];
  }
}

closeBtn.onclick = closeLightbox;

lightbox.onclick = function (e) {
  if (e.target === lightbox) {
    closeLightbox();
  }
};

prevBtn.onclick = showPreviousImage;
nextBtn.onclick = showNextImage;

renderGallery();