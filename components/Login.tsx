"use client"

export default function Login(){
    return (
        <div className="flex flex-col justify-center items-center">
            <h1>Herald</h1>
            <div className="flex flex-col justify-center items-center">
                <h2>Sign in to Dashboard</h2>
                <span>
                    or sign in with
                </span>
                <form action="">
                    <label htmlFor="">Email</label>
                    <input type="email" />
                    <label htmlFor="">Password</label>
                    <input type="password" />
                    <label htmlFor="">TOTP</label>
                    <input type="text" />
                    <button>Sign in</button>
                </form>
            </div>
        </div>
    )
}