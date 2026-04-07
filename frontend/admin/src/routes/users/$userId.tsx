import { useUser } from '#/api/user';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/users/$userId')({
  component: User,
})

function User() {
  const { userId } = Route.useParams();
  const { data: user, isLoading, error } = useUser(userId ? parseInt(userId) : undefined);
  if(isLoading) return (
    <main className="page-wrap px-4 py-12 flex items-center justify-center">
      Carregando...
    </main>
  )
  if(error) return (
    <main className="page-wrap px-4 py-12 flex items-center justify-center">
      Erro ao carregar usuário [{userId}].
    </main>
  )
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p>ID: {userId}</p>
        <p>Nome: {user?.name}</p>
        <p>Email: {user?.email}</p>
      </section>
    </main>
  )
}
