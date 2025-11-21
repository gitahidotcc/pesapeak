import { redirect } from "next/navigation";
import { getServerSession, signOutFormAction } from "@/lib/auth-actions";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const hasCompletedOnboarding = (session.user as { hasCompletedOnboarding?: boolean }).hasCompletedOnboarding;

  if (hasCompletedOnboarding === false) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Welcome back, {session.user.name}!
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <form action={signOutFormAction}>
                <button
                  type="submit"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Dashboard
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>This is a protected dashboard page. You are successfully authenticated!</p>
              </div>
              <div className="mt-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{session.user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">User ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{session.user.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Session ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{session.session.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created At</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(session.session.createdAt).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
