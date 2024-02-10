
// add class navbarDark on navbar scroll
// const header = document.querySelector('.navbarDark')
// const header_text = document.querySelectorAll('.header-text')

// function refreshHeader() {
//     const top = 100
    
//     // header.style.backgroundColor = `rgba(0, 0, 0, ${top/100})`
//     // header_text.forEach(element => {
//     //     const val = top * 255 / 100
//     //     element.style.color = `rgb(${val}, ${val}, ${val})`
//     // })
// }

// window.onscroll = refreshHeader
// window.onload = refreshHeader

// collapse navbar after click on small devices
// const navLinks = document.querySelectorAll('.nav-item')
// const menuToggle = document.getElementById('navbarSupportedContent')

// navLinks.forEach((l) => {
//     l.addEventListener('click', () => { new bootstrap.Collapse(menuToggle).toggle() })
// })

document.addEventListener("DOMContentLoaded", function() {
    // Get the title element
    var titleElement = document.querySelector('.hero-text');
    // TODO Don't run on pages without this

    // Add the transition class
    titleElement.classList.add('hero-transition');

    // Adjust the top margin after a brief delay (to ensure the transition class is applied)
    setTimeout(() => {
        titleElement.style.marginTop = '40px';
        titleElement.style.opacity = 1;
    }, 10);

    // Ensure that video plays
    document.addEventListener("click", function() {
        document.querySelectorAll('video').forEach(video => {
            video.play()
        })
    })
});


