const switchToSignUp = () => {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('signupContainer').style.display = 'block';
}

const switchToLogin = () => {
    document.getElementById('signupContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'block';
}

const signUp = () => {
    const signUpForm = document.getElementById('sign-up');
    signUpForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('signupPassword').value;

        const errorElement = document.getElementById('error1');

        try {
            const response = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userId', data.user.userId);
                window.location.href = 'index.html';
            } else {
                errorElement.textContent = `Error: ${data.message}`;
                errorElement.style.display = 'block';
            }
        } catch (error) {
            console.error('Error during sign-up:', error);
            errorElement.textContent = 'An error occurred. Please try again.';
            errorElement.style.display = 'block';
        }
    });
}

const login = () => {
    document.getElementById('login').addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const errorElement = document.getElementById('error');

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userId', data.user.userId);
                window.location.href = 'index.html';
            } else {
                errorElement.textContent = "Log In Error: Incorrect Username or Password";
                errorElement.style.display = 'block';
            }
        } catch (error) {
            console.error('Error during login:', error);
            errorElement.textContent = 'An error occurred. Please try again.';
            errorElement.style.display = 'block';
        }
    });
} 