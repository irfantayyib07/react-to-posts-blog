import { useSelector } from 'react-redux'
import { selectUserById } from '../users/usersSlice'
import { Link, useParams } from 'react-router-dom'
import { useGetPostsByUserIdQuery } from '../posts/postsSlice'

const UserPage = () => {
 const { userId } = useParams()
 const user = useSelector(state => selectUserById(state, +userId))

 const {
  data: postsByUserId,
  isLoading,
  isSuccess,
  isError,
  error
 } = useGetPostsByUserIdQuery(userId);

 if (isLoading) return <p>Loading...</p>
 if (isError) return <p>{error}</p>

 const { ids, entities } = postsByUserId

 return (
  <section>
   <h2>{user?.name}</h2>

   <ol>
    {isSuccess && ids.map(id => (
     <li key={id}>
      <Link to={`/post/${id}`}>{entities[id].title}</Link>
     </li>
    ))}
   </ol>
  </section>
 )
}

export default UserPage
