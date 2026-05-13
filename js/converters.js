function convertorsShowHide(type) {
    if ( document.getElementById(`${type}sGrid`).classList.contains('active') ) {
        document.getElementById(`${type}sGrid`).classList.remove('active')
    } else {
        document.getElementById(`${type}sGrid`).classList.add('active')
    }
}