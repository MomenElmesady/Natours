
const hideAlert2 = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

const showAlert2 = (type, msg) => {
    hideAlert2();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
};

const updateSettings = async (data, type) => {
    try {
        const url = type === "password" ? "http://localhost:3000/api/v1/users/updateMyPassword" : "http://localhost:3000/api/v1/users/updateMe"
        console.log(url)

        const res = await axios({
            method: 'PATCH',
            url,
            data
        });
        console.log("test res")
        showAlert2("success", `${type.toUpperCase()} updated successfully`)
    } catch (err) {
        console.log(err)
        showAlert2("error")
    }
}

const userDataForm = document.querySelector(".form-user-data")
const userPasswordForm = document.querySelector(".form-user-password")


if (userDataForm) {
    userDataForm.addEventListener("submit", e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    updateSettings(form, 'data');
    })
}

if (userPasswordForm) {
    userPasswordForm.addEventListener("submit", async e => {
        e.preventDefault()

        document.querySelector("btn--save-password").textContent = "Updating..."
        const passwordCurrent = document.getElementById('password-current').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('password-confirm').value
        await updateSettings({ passwordCurrent, password, passwordConfirm }, "password")

        document.querySelector("btn--save-password").textContent = "SAVE PASSWORD"

        document.getElementById('password-current').value = ""
        document.getElementById('password').value = ""
        document.getElementById('password-confirm').value = ""
    })
}