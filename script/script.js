// add class navbarDark on navbar scroll
const header = document.querySelector('.navbarDark')
const header_text = document.querySelectorAll('.header-text')

function refreshHeader() {
    const top = window.scrollY
    header.style.backgroundColor = `rgba(0, 0, 0, ${top/100})`
    header_text.forEach(element => {
        const val = top * 255 / 100
        element.style.color = `rgb(${val}, ${val}, ${val})`
    })
}

window.onscroll = refreshHeader
window.onload = refreshHeader

// collapse navbar after click on small devices
const navLinks = document.querySelectorAll('.nav-item')
const menuToggle = document.getElementById('navbarSupportedContent')

// navLinks.forEach((l) => {
//     l.addEventListener('click', () => { new bootstrap.Collapse(menuToggle).toggle() })
// })