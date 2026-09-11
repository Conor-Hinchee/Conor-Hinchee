## **I Rebuilt the Product Carousel at Work — And I’m Glad I Did**

First off, I hate _your_ UI carousels. You hate _my_ UI carousels. And the users? [They hate _everyone’s_](https://firstmonday.org/ojs/index.php/fm/article/download/11801/10592) carousels.

This being the year of our lord 2025, I am hopeful that we will soon transcend the tired UI carousel of the past. But sometimes, they _are_ the right UI for the job—if only because users are trained to expect them..

So when I was tasked with rebuilding the user experience on the e-commerce product page, it might be surprising that I didn’t reach for a library; _especially_ as an active maintainer of [Pure React Carousel](https://express-labs.github.io/pure-react-carousel/).

### Libraries 🧐

There are a ton of carousel libraries out there: [Swiper](https://swiperjs.com/), [Slick Carousel](https://kenwheeler.github.io/slick/), [Glide.js](https://glidejs.com/), [Splide](https://splidejs.com/), [Embla Carousel](https://www.embla-carousel.com/), and of course, [Pure React Carousel](%link here%).

Now, I haven’t used all of these—and I’m sure some of them are excellent. But as I audited my options, most of them were either **too big**, **too opinionated**, or **too inflexible** for the exact UX I was building.

In the past, these libraries made sense—handling touch events, accessibility quirks, arrow logic, and more. But modern CSS has changed the game. Scroll behavior, snapping, and overflow are now Modern _default browser features_. You can build a usable, responsive carousel with just a div inside a div—no JavaScript required.

## **Div in a div 🪵**

So, just like the many grey beards that came before me, I decided to reinvent the wheel.

Only this time, the wheel is just a div in a div—and thanks to modern CSS, it rolls pretty damn smoothly. With a bit of scroll-snap, some flexbox, and a few browser niceties, you can build a functional, responsive, swipeable carousel with _no JavaScript at all_.

No event listeners. No refs. No “isDragging” state bugs. Just HTML and CSS doing what they were always meant to do .

### THE CODE:

```
<div class="carousel">
  <div class="carousel-container" id="carousel">
    <div class="carousel-slide slide-1">Slide 1</div>
    <div class="carousel-slide slide-2">Slide 2</div>
    <div class="carousel-slide slide-3">Slide 3</div>
    <div class="carousel-slide slide-4">Slide 4</div>
    <div class="carousel-slide slide-5">Slide 5</div>
  </div>
</div>
```

```
.carousel {
  position: relative;
  margin: 2rem auto;
  max-width: 800px;
}

.carousel-container {
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  border-radius: 8px;
}

.carousel-container::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Opera */
}

.carousel-slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.slide-1 { background-color: #3498db; }
.slide-2 { background-color: #e74c3c; }
.slide-3 { background-color: #2ecc71; }
.slide-4 { background-color: #f39c12; }
.slide-5 { background-color: #9b59b6; }
```

▶️ [Live Demo on CodePen](https://codepen.io/captnstarburst-the-animator/pen/dPPqRJZ)

---

### To Production 🚀

Well, not so fast Production-ready carousels aren’t just scrollable—they’re **navigable**, **announced**, and **intentionally interactive**. If thats news to you, you should check out one of the libraries listed above!

## **What I Gained**

- **Better UX**: Users have an improved experience
- **Team confidence**: Everyone can read and modify the carousel without having a library abstraction
- **Satisfaction**: Building the thing felt better than duct-taping a lib again.
