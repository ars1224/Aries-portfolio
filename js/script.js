const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const revealItems = document.querySelectorAll(".reveal");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileNavQuery = window.matchMedia("(max-width: 920px)");

function updateHeaderState() {
  if (!header || !hero) {
    return;
  }

  header.classList.toggle("on-hero", window.scrollY <= 8);
}

if (menuToggle && navigation) {
  const navLinks = Array.from(navigation.querySelectorAll("a"));

  function setNavigationState(isOpen) {
    const isMobile = mobileNavQuery.matches;
    const isHidden = isMobile && !isOpen;

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      `${isOpen ? "Close" : "Open"} navigation`
    );

    navigation.classList.toggle("open", isMobile && isOpen);
    navigation.setAttribute("aria-hidden", String(isHidden));

    if ("inert" in navigation) {
      navigation.inert = isHidden;
    } else if (isHidden) {
      navigation.setAttribute("inert", "");
    } else {
      navigation.removeAttribute("inert");
    }

    navLinks.forEach((link) => {
      if (isHidden) {
        link.setAttribute("tabindex", "-1");
      } else {
        link.removeAttribute("tabindex");
      }
    });

    if (isHidden && navigation.contains(document.activeElement)) {
      menuToggle.focus({ preventScroll: true });
    }
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setNavigationState(!isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setNavigationState(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavigationState(false);
    }
  });

  if (mobileNavQuery.addEventListener) {
    mobileNavQuery.addEventListener("change", () => setNavigationState(false));
  } else {
    mobileNavQuery.addListener(() => setNavigationState(false));
  }

  setNavigationState(false);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("resize", updateHeaderState);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
  revealObserver.observe(item);
});

const projectCarousels = Array.from(document.querySelectorAll(".project-media"))
  .map((media) => {
    const slides = Array.from(media.children).filter(
      (element) => element.tagName === "IMG"
    );

    if (slides.length <= 1) {
      return null;
    }

    media.classList.add("project-gallery");

    const dots = document.createElement("div");
    dots.className = "carousel-dots";
    dots.setAttribute("aria-hidden", "true");

    slides.forEach(() => {
      dots.appendChild(document.createElement("span"));
    });

    media.appendChild(dots);

    return {
      dots,
      index: 0,
      media,
      slides,
      timer: null,
    };
  })
  .filter(Boolean);

function setCarouselSlide(carousel, nextIndex) {
  carousel.index = (nextIndex + carousel.slides.length) % carousel.slides.length;

  carousel.slides.forEach((slide, index) => {
    const isActive = index === carousel.index;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
  });

  Array.from(carousel.dots.children).forEach((dot, index) => {
    dot.classList.toggle("is-active", index === carousel.index);
  });
}

function stopCarousel(carousel) {
  if (!carousel.timer) {
    return;
  }

  window.clearInterval(carousel.timer);
  carousel.timer = null;
}

function startCarousel(carousel) {
  stopCarousel(carousel);

  if (reducedMotionQuery.matches) {
    return;
  }

  carousel.timer = window.setInterval(() => {
    setCarouselSlide(carousel, carousel.index + 1);
  }, 3200);
}

function syncProjectCarousel(carousel) {
  carousel.media.classList.add("is-carousel");
  carousel.media.setAttribute("aria-roledescription", "carousel");
  carousel.media.setAttribute("tabindex", "0");
  setCarouselSlide(carousel, carousel.index);
  startCarousel(carousel);
}

function syncProjectCarousels() {
  projectCarousels.forEach(syncProjectCarousel);
}

projectCarousels.forEach((carousel) => {
  carousel.media.addEventListener("focusin", () => stopCarousel(carousel));
  carousel.media.addEventListener("focusout", () => startCarousel(carousel));
});

syncProjectCarousels();

if (reducedMotionQuery.addEventListener) {
  reducedMotionQuery.addEventListener("change", syncProjectCarousels);
} else {
  reducedMotionQuery.addListener(syncProjectCarousels);
}

document.querySelectorAll("[data-video-player]").forEach((player) => {
  const video = player.querySelector("video");
  const toggle = player.querySelector(".video-toggle");

  if (!video || !toggle) {
    return;
  }

  function updateVideoState() {
    const isPlaying = !video.paused && !video.ended;
    player.classList.toggle("is-playing", isPlaying);
    toggle.setAttribute(
      "aria-label",
      `${isPlaying ? "Pause" : "Play"} KISS-Web desktop landscape demo`
    );
  }

  function toggleVideo() {
    if (video.paused || video.ended) {
      video.play().catch(() => {});
      return;
    }

    video.pause();
  }

  toggle.addEventListener("click", toggleVideo);
  video.addEventListener("click", toggleVideo);
  video.addEventListener("play", () => {
    player.classList.add("has-played");
  });
  video.addEventListener("play", updateVideoState);
  video.addEventListener("pause", updateVideoState);
  video.addEventListener("ended", updateVideoState);
  updateVideoState();
});
