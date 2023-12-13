
const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
};
const login = async (email, password) => {

    const res = await axios({
        method: "POST",
        url: "http://localhost:3000/api/v1/users/login",
        data: {
            email,
            password
        }
    })
    if (res.data.status === "succeed") {
        showAlert("success", "logged in")
        window.setTimeout(() => {
            location.assign("/")
        }, 1500)
    }
    // i execute fake solution becouse if i use try catch it execute try block without sense the error so i find this sol for that problem 
    // solve it when come back 
    else {
        showAlert("error", res.data.message)
    }

}


const logout = async () => {
    try {
        const res = await axios({
            method: "GET",
            url: "http://localhost:3000/api/v1/users/logout",
        })
        if (res.data.status == "success") location.reload(true) 
    } catch (err) {
        console.log(err)
        showAlert("error", "Error, Try again")
    }
}

const loginClick = document.querySelector(".form--login")
const logoutClick = document.querySelector(".nav__el--logout")

if (loginClick){
    document.querySelector(".form").addEventListener("submit", e => {
        e.preventDefault();
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email, password)
    })
}
if (logoutClick){
    document.querySelector(".nav__el--logout").addEventListener("click",()=>{
        console.log("logging out!!")
        logout()
    })
}    


















// console.log(document.querySelector(".nav__el--logout"))
// document.querySelector(".nav__el--logout").addEventListener("click",()=>{
//     logout
// })

// const res = await axios({
//     method: "POST",
//     url: "http://127.0.0.1:3000/api/v1/users/login",
//     data: {
//         email,
//         password
//     }
// })
// console.log(res)