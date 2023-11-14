import { useSelector } from "react-redux/es/hooks/useSelector"
import { selectAllPosts } from "./postsSlice"
import PostAuthor from "./PostAuthor";
import TimeAgo from "./TimeAgo";
import ReactionButtons from "./ReactionButtons";

const PostsList = () => {
 const posts = useSelector(selectAllPosts);

 const orderedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date))

 const renderedPosts = orderedPosts.map(post => {
  return <article key={post.id}>
   <h3>{post.title}</h3>
   <p>{post.content.substring(0, 100)}</p>

   <p className="postCredit">
    <PostAuthor userId={post.userId}></PostAuthor>
    <TimeAgo timestamp={post.date}></TimeAgo>
   </p>

   <ReactionButtons post={post}></ReactionButtons>
  </article>
 })

 return (
  <section>
   <h2>Posts</h2>
   {renderedPosts}
  </section>
 )
}

export default PostsList
