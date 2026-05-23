import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function LoginPage() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.get('logged_in')?.value === 'true'

  if (isLoggedIn) {
    redirect('/weight')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">退休计划</h1>
          <p className="mt-2 text-gray-600">请输入访问密码</p>
        </div>

        <form
          action="/api/auth/login"
          method="POST"
          className="mt-8 space-y-6"
        >
          <div>
            <label htmlFor="password" className="sr-only">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="relative block w-full rounded-md border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="请输入密码"
            />
          </div>

          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  )
}
