// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate Lenis with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Document ready
document.addEventListener("DOMContentLoaded", () => {
    
    // Custom Cursor
    const cursor = document.querySelector('.custom-cursor');
    const linksAndBtns = document.querySelectorAll('a, button, .hover-target');

    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: "power2.out"
        });
    });

    linksAndBtns.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    // Hero Entry Animation sequence
    const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // Initial delay then text reveal
    heroTl.to('.reveal-text', {
        y: "0%",
        duration: 1.2,
        stagger: 0.15,
        delay: 0.2
    })
    .to('.hero-subtitle', {
        opacity: 1,
        y: 0,
        yFrom: 20,
        duration: 1
    }, "-=0.8")
    .to('.fade-in-up', {
        opacity: 1,
        y: 0,
        yFrom: 30,
        duration: 1,
        stagger: 0.2
    }, "-=0.8")
    // Parallax effect on the background orbs on scroll
    .to('.hero-bg', {
        yPercent: 30,
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    }, 0);

    // About Section Animations
    gsap.utils.toArray('.fade-in-about').forEach(el => {
        gsap.set(el, { opacity: 0, y: 30 });
    });

    const aboutTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.about',
            start: 'top 70%'
        }
    });

    aboutTl.to('.reveal-text-about .reveal-inline', {
        y: "0%",
        duration: 1,
        stagger: 0.1,
        ease: "power4.out"
    })
    .to('.fade-in-about', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
    }, "-=0.6");

    // Work Section Filter and Animate
    const projects = document.querySelectorAll('.project-card');
    
    ScrollTrigger.batch(".project-card", {
        start: "top 85%",
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" })
    });

    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            gsap.to(projects, {
                opacity: 0,
                y: 20,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                    projects.forEach(p => {
                        if (filter === 'all' || p.getAttribute('data-category') === filter) {
                            p.style.display = 'flex';
                        } else {
                            p.style.display = 'none';
                        }
                    });
                    
                    ScrollTrigger.refresh();
                    
                    const visibleProjects = Array.from(projects).filter(p => p.style.display !== 'none');
                    gsap.to(visibleProjects, {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: "power3.out"
                    });
                }
            });
        });
    });

    // Global Fade Up Animations (for thoughts, testimonials, contact)
    const fadeUps = document.querySelectorAll('.fade-in-up');
    fadeUps.forEach(el => {
        gsap.set(el, { opacity: 0, y: 40 });
        ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
        });
    });

    // Back to Top Button
    const backToTop = document.querySelector('.back-to-top');
    if(backToTop) {
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            lenis.scrollTo(0, { duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        });
    }

    // Fullscreen Lightbox Logic
    const lightbox = document.getElementById('media-lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxVideo = document.querySelector('.lightbox-video');
    const lightboxClose = document.querySelector('.lightbox-close');
    const triggers = document.querySelectorAll('.lightbox-trigger');

    if(lightbox) {
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const mediaSrc = trigger.getAttribute('data-media');
                const mediaType = trigger.getAttribute('data-type');
                
                if(!mediaSrc) return;

                lightboxImg.style.display = 'none';
                lightboxVideo.style.display = 'none';
                
                try {
                    if (!lightboxVideo.paused) lightboxVideo.pause();
                } catch(e) {}
                
                if(mediaType === 'video') {
                    lightboxVideo.src = mediaSrc;
                    lightboxVideo.style.display = 'block';
                    setTimeout(() => {
                        try { lightboxVideo.play(); } catch(e) {}
                    }, 50);
                } else {
                    lightboxImg.src = mediaSrc;
                    lightboxImg.style.display = 'block';
                }
                
                lightbox.classList.add('active');
                lenis.stop();
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            lenis.start(); 
            
            setTimeout(() => {
                try {
                    if (!lightboxVideo.paused) lightboxVideo.pause();
                    lightboxVideo.removeAttribute('src'); 
                    lightboxVideo.load();
                } catch(e) {}
                lightboxImg.src = '';
            }, 400); 
        };

        if(lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        
        lightbox.addEventListener('click', (e) => {
            if(e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if(e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // Optional: Refresh triggers once a bit later to catch any layout shifts
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 500);

});
