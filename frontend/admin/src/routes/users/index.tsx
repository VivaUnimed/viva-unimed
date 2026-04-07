import { useUsers } from '#/api/user';
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/users/')({
  component: Users,
})

function Users() {
  const { data: users, isLoading } = useUsers();
  if(isLoading) return (
    <main className="page-wrap px-4 py-12 flex items-center justify-center">
      Carregando...
    </main>
  )
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        {
          users?.map((user) => (
            <div key={user.id} className=''>
              <Link
                to="/users/$userId"
                params={{ userId: user.id.toString() }}
                className='text-blue-500 hover:underline cursor-pointer'
              >
                <p>Nome: {user.name} Email: {user.email}</p>
              </Link>
            </div>
          ))
        }
      </section>
    </main>
  )
}
