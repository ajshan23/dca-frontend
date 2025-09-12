import SignInForm from './SignInForm'

const SignIn = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="mb-8 text-center">
                    <h3 className="mb-1 text-2xl font-semibold text-gray-800">Welcome back!</h3>
                    <p className="text-gray-600">Please enter your credentials to sign in!</p>
                </div>
                <SignInForm disableSubmit={false} />
            </div>
        </div>
    )
}

export default SignIn