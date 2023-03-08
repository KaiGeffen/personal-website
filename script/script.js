// add class navbarDark on navbar scroll
const header = document.querySelector('.navbarDark')

window.onscroll = () => {
    const top = window.scrollY
    header.style.backgroundColor = `rgba(0, 0, 0, ${top/100})`
}
// collapse navbar after click on small devices
const navLinks = document.querySelectorAll('.nav-item')
const menuToggle = document.getElementById('navbarSupportedContent')

// navLinks.forEach((l) => {
//     l.addEventListener('click', () => { new bootstrap.Collapse(menuToggle).toggle() })
// })